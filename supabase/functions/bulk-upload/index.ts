import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import * as XLSX from 'https://esm.sh/xlsx@0.18.5'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file')
    const uploadId = formData.get('uploadId')

    if (!file || !uploadId) {
      throw new Error('Missing file or upload ID')
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Read Excel file
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer)
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    const rows = XLSX.utils.sheet_to_json(worksheet)

    let processedCount = 0
    let failedCount = 0

    for (const row of rows) {
      try {
        const { email, name, role, password } = row as any

        if (!email || !name || !role || !password) {
          throw new Error('Missing required fields')
        }

        // Process user using the database function
        const { data, error } = await supabase.rpc('process_user_upload', {
          p_email: email,
          p_password: password,
          p_name: name,
          p_role: role.toLowerCase()
        })

        if (error) throw error
        processedCount++
      } catch (error) {
        failedCount++
        // Log error
        await supabase
          .from('bulk_upload_errors')
          .insert({
            upload_id: uploadId,
            row_number: processedCount + failedCount,
            error_message: error.message
          })
      }
    }

    // Update upload status
    await supabase
      .from('bulk_user_uploads')
      .update({
        status: failedCount === rows.length ? 'failed' : 'completed',
        processed_count: processedCount,
        failed_count: failedCount,
        updated_at: new Date().toISOString()
      })
      .eq('id', uploadId)

    return new Response(
      JSON.stringify({
        message: 'File processed',
        processed: processedCount,
        failed: failedCount
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: 'Failed to process file',
        details: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})