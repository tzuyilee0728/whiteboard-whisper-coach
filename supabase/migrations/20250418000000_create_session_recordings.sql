
-- Create the session_recordings table
CREATE TABLE IF NOT EXISTS public.session_recordings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id TEXT NOT NULL,
    audio_data TEXT, -- Base64 encoded audio data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create stored procedure for saving recordings
CREATE OR REPLACE FUNCTION public.save_session_recording(
    p_session_id TEXT,
    p_audio_data TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.session_recordings (session_id, audio_data)
    VALUES (p_session_id, p_audio_data);
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$;

-- Add index for faster lookup by session_id
CREATE INDEX IF NOT EXISTS idx_session_recordings_session_id ON public.session_recordings(session_id);

-- Add row level security policy
ALTER TABLE public.session_recordings ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations for authenticated users
CREATE POLICY "Allow full access to authenticated users" ON public.session_recordings
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
