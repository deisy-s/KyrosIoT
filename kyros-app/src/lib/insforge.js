import { createClient } from '@supabase/supabase-js'

const INSFORGE_BASE_URL = 'https://hy3va9vj.us-east.insforge.app'
const INSFORGE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3OC0xMjM0LTU2NzgtOTBhYi1jZGVmMTIzNDU2NzgiLCJlbWFpbCI6ImFub25AaW5zZm9yZ2UuY29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxNDA4ODl9.ZyXS1An5v2pB1K7cpuEsokNSdOS_ZepzV-KPihw67Mc'

export const insforge = createClient(INSFORGE_BASE_URL, INSFORGE_ANON_KEY, {
    global: {
        fetch: async (url, options) => {
            const urlStr = url.toString();
            let newUrl = urlStr;
            let isLogin = false;

            // 1. Path mapping
            if (urlStr.includes('/rest/v1/')) {
                newUrl = urlStr.replace('/rest/v1/', '/api/database/records/');
            } else if (urlStr.includes('/auth/v1/signup')) {
                newUrl = urlStr.replace('/auth/v1/signup', '/api/auth/users');
            } else if (urlStr.includes('/auth/v1/token')) {
                newUrl = urlStr.replace('/auth/v1/token', '/api/auth/sessions');
                isLogin = true;
            }

            // Ensure correct apikey is sent for InsForge (Architect Fix)
            options = options || {};
            options.headers = options.headers || {};
            let isSingle = false;

            if (options.headers instanceof Headers) {
                options.headers.set('apikey', 'ik_cc29e1ad1baff2e3f4b0c8ecd26bb0dd');
                if ((options.headers.get('Accept') || '').includes('application/vnd.pgrst.object+json')) {
                    isSingle = true;
                    options.headers.set('Accept', 'application/json');
                }
            } else {
                options.headers['apikey'] = 'ik_cc29e1ad1baff2e3f4b0c8ecd26bb0dd';
                if ((options.headers['Accept'] || '').includes('application/vnd.pgrst.object+json')) {
                    isSingle = true;
                    options.headers['Accept'] = 'application/json';
                }
            }

            const response = await fetch(newUrl, options);
            
            // Fix 406 Not Acceptable for .single() queries by wrapping the array response into an object
            if (isSingle && response.ok) {
                const data = await response.json();
                const singleObj = Array.isArray(data) ? (data.length > 0 ? data[0] : null) : data;
                return new Response(JSON.stringify(singleObj), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            // 2. Global Error Handling (401 Unauthorized)
            if (response.status === 401 && !isLogin) {
                console.warn('Sesión expirada o inválida detectada (401). Limpiando credenciales...');
                localStorage.removeItem('user');
                // Redirigir a login si estamos en el navegador
                if (typeof window !== 'undefined' && !window.location.pathname.includes('/signin')) {
                    window.location.href = '/signin?error=expired';
                }
            }

            // 3. Response translation for Login compatibility
            if (isLogin && response.ok) {
                const data = await response.json();
                const supabaseFormat = {
                    user: data.user,
                    access_token: data.accessToken,
                    refresh_token: data.refreshToken || 'not_supported_by_insforge',
                    expires_in: 3600,
                    token_type: 'bearer'
                };

                return new Response(JSON.stringify(supabaseFormat), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            return response;
        }
    },
    auth: {
        autoRefreshToken: false, 
        persistSession: true,
        detectSessionInUrl: true
    }
})
