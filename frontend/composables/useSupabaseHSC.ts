import { createClient } from '@supabase/supabase-js'

export const useSupabaseHSC = () => {
    const config = useRuntimeConfig()

    // Initialize the standalone client
    const client = createClient(
        config.public.supabaseCortexHSC_URL,
        config.public.supabaseCortexHSC_KEY
    )

    return client
}
