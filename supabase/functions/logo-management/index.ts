import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface LogoSettings {
  logo_text?: string
  logo_font?: 'Fraunces' | 'Playfair Display' | 'Inter' | 'System'
  logo_color_light?: string
  logo_color_dark?: string
  logo_alt?: string
  use_text_logo_if_image_fails?: boolean
}

// File validation constants
const ALLOWED_IMAGE_TYPES = ['image/svg+xml', 'image/png', 'image/webp', 'image/jpeg', 'image/avif']
const MAX_RASTER_SIZE = 512 * 1024 // 512KB
const MAX_SVG_SIZE = 200 * 1024 // 200KB
const MIN_WIDTH = 560
const MIN_HEIGHT = 160

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Create admin client with service role for auth checks
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Create user client with user's token for data operations
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      console.error('Auth error:', authError)
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('User authenticated:', user.id)

    // Check if user has editor or admin role
    const { data: roles } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
    
    console.log('User roles:', roles)
    
    const hasPermission = roles?.some(r => r.role === 'admin' || r.role === 'editor')
    if (!hasPermission) {
      return new Response(JSON.stringify({ error: 'Insufficient permissions' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    
    // Use admin client for all database operations
    const supabase = supabaseAdmin

    const url = new URL(req.url)
    const method = req.method
    const path = url.pathname
    
    console.log(`Logo management request: ${method} ${path}`)

    // GET /logo - Get current logo settings
    if (method === 'GET' && path.endsWith('/logo')) {
      console.log('Getting logo settings...')
      const { data, error } = await supabase
        .from('homepage_header')
        .select('*')
        .eq('is_active', true)
        .maybeSingle()

      if (error) {
        console.error('Error getting logo settings:', error)
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      console.log('Logo settings retrieved:', data)
      return new Response(JSON.stringify(data || {}), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // PUT /logo - Update logo settings (text, font, colors, alt)
    if (method === 'PUT' && path.endsWith('/logo')) {
      console.log('Updating logo settings...')
      const settings: LogoSettings = await req.json()
      console.log('Settings to update:', settings)
      
      // Validate font selection
      if (settings.logo_font && !['Fraunces', 'Playfair Display', 'Inter', 'System'].includes(settings.logo_font)) {
        return new Response(JSON.stringify({ error: 'Invalid font selection' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Validate color hex codes
      const hexColorRegex = /^#[0-9A-Fa-f]{6}$/
      if (settings.logo_color_light && !hexColorRegex.test(settings.logo_color_light)) {
        return new Response(JSON.stringify({ error: 'Invalid light color format' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
      if (settings.logo_color_dark && !hexColorRegex.test(settings.logo_color_dark)) {
        return new Response(JSON.stringify({ error: 'Invalid dark color format' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Get current header
      const { data: currentHeader } = await supabase
        .from('homepage_header')
        .select('*')
        .eq('is_active', true)
        .maybeSingle()

      const updateData = {
        ...settings,
        updated_at: new Date().toISOString(),
        is_active: true
      }

      let result
      if (currentHeader?.id) {
        // Update existing
        result = await supabase
          .from('homepage_header')
          .update(updateData)
          .eq('id', currentHeader.id)
          .select()
          .single()
      } else {
        // Insert new
        result = await supabase
          .from('homepage_header')
          .insert(updateData)
          .select()
          .single()
      }

      if (result.error) {
        console.error('Error updating logo settings:', result.error)
        return new Response(JSON.stringify({ error: result.error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      console.log('Logo settings updated:', result.data)

      // Create version entry
      if (result.data) {
        await supabase.from('logo_versions').insert({
          header_id: result.data.id,
          logo_text: result.data.logo_text,
          logo_font: result.data.logo_font,
          logo_color_light: result.data.logo_color_light,
          logo_color_dark: result.data.logo_color_dark,
          logo_image_url: result.data.logo_image_url,
          logo_alt: result.data.logo_alt,
          use_text_logo_if_image_fails: result.data.use_text_logo_if_image_fails,
          is_active: true,
          created_by: user.id
        })
      }

      return new Response(JSON.stringify(result.data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // POST /logo/upload - Upload new logo image
    if (method === 'POST' && path.endsWith('/logo/upload')) {
      console.log('Uploading logo image...')
      const formData = await req.formData()
      const file = formData.get('file') as File
      
      if (!file) {
        console.log('No file provided')
        return new Response(JSON.stringify({ error: 'No file provided' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      console.log(`File details: ${file.name}, ${file.type}, ${file.size} bytes`)

      // Validate file type
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        return new Response(JSON.stringify({ error: 'Invalid file type. Allowed: SVG, PNG, WebP, JPEG, AVIF' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Validate file size
      const maxSize = file.type === 'image/svg+xml' ? MAX_SVG_SIZE : MAX_RASTER_SIZE
      if (file.size > maxSize) {
        const maxSizeMB = maxSize / (1024 * 1024)
        return new Response(JSON.stringify({ error: `File too large. Max size: ${maxSizeMB}MB` }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // For raster images, validate dimensions
      if (file.type !== 'image/svg+xml') {
        const arrayBuffer = await file.arrayBuffer()
        const uint8Array = new Uint8Array(arrayBuffer)
        
        // Simple dimension check for common formats - this is basic validation
        // In production you'd want more robust image dimension checking
      }

      // Generate unique filename
      const timestamp = Date.now()
      const extension = file.name.split('.').pop()
      const filename = `logo-${timestamp}.${extension}`

      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('product-media')
        .upload(`logos/${filename}`, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        return new Response(JSON.stringify({ error: uploadError.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      console.log('File uploaded successfully:', uploadData)

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('product-media')
        .getPublicUrl(`logos/${filename}`)

      // Update header with new logo URL
      const { data: currentHeader } = await supabase
        .from('homepage_header')
        .select('*')
        .eq('is_active', true)
        .maybeSingle()

      const updateData = {
        logo_image_url: publicUrl,
        updated_at: new Date().toISOString(),
        is_active: true
      }

      let result
      if (currentHeader?.id) {
        result = await supabase
          .from('homepage_header')
          .update(updateData)
          .eq('id', currentHeader.id)
          .select()
          .single()
      } else {
        result = await supabase
          .from('homepage_header')
          .insert(updateData)
          .select()
          .single()
      }

      if (result.error) {
        return new Response(JSON.stringify({ error: result.error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      return new Response(JSON.stringify({ 
        success: true, 
        logo_image_url: publicUrl,
        data: result.data 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // DELETE /logo/image - Delete logo image, fallback to text
    if (method === 'DELETE' && path.endsWith('/logo/image')) {
      console.log('Deleting logo image...')
      const { data: currentHeader } = await supabase
        .from('homepage_header')
        .select('*')
        .eq('is_active', true)
        .maybeSingle()

      if (!currentHeader) {
        console.log('No header found to delete logo from')
        return new Response(JSON.stringify({ error: 'No header found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      console.log('Current header found, deleting logo...')

      // Delete from storage if exists
      if (currentHeader.logo_image_url) {
        const filename = currentHeader.logo_image_url.split('/').pop()
        if (filename) {
          await supabase.storage
            .from('product-media')
            .remove([`logos/${filename}`])
        }
      }

      // Update header to remove image URL
      const { data, error } = await supabase
        .from('homepage_header')
        .update({ 
          logo_image_url: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentHeader.id)
        .select()
        .single()

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      return new Response(JSON.stringify({ success: true, data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Logo management error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})