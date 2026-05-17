import { createClient } from '@supabase/supabase-js'

export const useSupabaseMedical = () => {
    const config = useRuntimeConfig()

    // Initialize the standalone client
    const client = createClient(
        config.public.supabaseCortexMedical_URL,
        config.public.supabaseCortexMedical_KEY
    )

    return client
}
