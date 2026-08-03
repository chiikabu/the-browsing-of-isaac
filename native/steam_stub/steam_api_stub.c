/* Offline steam_api stub — proper Steamworks ContextInit protocol.
 * Built via scripts/build-steam-stub-pe.py (no mingw required) OR this C
 * source if i686-w64-mingw32-gcc is available.
 *
 * SteamInternal_SteamAPI_Init returns ESteamAPIInitResult_OK (0).
 * SteamAPI_IsSteamRunning returns 1 (offline).
 * ContextInit follows Valve ContextInitData layout and invokes pFn once.
 */
#include <stdint.h>
#include <stddef.h>

#ifdef _WIN32
#define STUB_API __declspec(dllexport) __cdecl
#define STDCALL __stdcall
#else
#define STUB_API
#define STDCALL
#endif

#ifdef _WIN32
__declspec(dllimport) void __stdcall OutputDebugStringA(const char *s);
#else
static void OutputDebugStringA(const char *s) { (void)s; }
#endif

enum { k_ESteamAPIInitResult_OK = 0 };

typedef struct {
  void *vtable;
} StubIface;

static int STDCALL noop0(void *thisptr) {
  (void)thisptr;
  return 0;
}
static int STDCALL noop1(void *thisptr, void *a) {
  (void)thisptr;
  (void)a;
  return 0;
}
static int STDCALL noop2(void *thisptr, void *a, void *b) {
  (void)thisptr;
  (void)a;
  (void)b;
  return 0;
}
static int STDCALL noop3(void *thisptr, void *a, void *b, void *c) {
  (void)thisptr;
  (void)a;
  (void)b;
  (void)c;
  return 0;
}
static uint64_t STDCALL noop64(void *thisptr) {
  (void)thisptr;
  return 0;
}

static void *g_vtable[256];
static StubIface g_iface;
static int g_ready;
static uint32_t g_init_counter = 1;

static void ensure_iface(void) {
  int i;
  if (g_ready) return;
  for (i = 0; i < 256; i++) {
    switch (i % 5) {
      case 0: g_vtable[i] = (void *)(uintptr_t)noop0; break;
      case 1: g_vtable[i] = (void *)(uintptr_t)noop1; break;
      case 2: g_vtable[i] = (void *)(uintptr_t)noop2; break;
      case 3: g_vtable[i] = (void *)(uintptr_t)noop3; break;
      default: g_vtable[i] = (void *)(uintptr_t)noop64; break;
    }
  }
  g_iface.vtable = g_vtable;
  g_ready = 1;
}

static void *iface_ptr(void) {
  ensure_iface();
  return &g_iface;
}

/* ContextInitData (x86): pFn*, counter, then CSteamAPIContext (iface ptrs) */
typedef struct {
  void (*pFn)(void *pCtx);
  uint32_t counter;
  /* ctx follows immediately */
} ContextInitData;

int STUB_API SteamAPI_Init(void) { return 1; }
int STUB_API SteamAPI_InitSafe(void) { return 1; }
void STUB_API SteamAPI_Shutdown(void) {}
void STUB_API SteamAPI_RunCallbacks(void) {}
void STUB_API SteamAPI_RegisterCallback(void *p, int i) {
  (void)p;
  (void)i;
}
void STUB_API SteamAPI_UnregisterCallback(void *p) { (void)p; }
void STUB_API SteamAPI_RegisterCallResult(void *p, uint64_t h) {
  (void)p;
  (void)h;
}
void STUB_API SteamAPI_UnregisterCallResult(void *p, uint64_t h) {
  (void)p;
  (void)h;
}
void *STUB_API SteamAPI_GetHSteamUser(void) { return (void *)(uintptr_t)1; }
void *STUB_API SteamAPI_GetHSteamPipe(void) { return (void *)(uintptr_t)1; }

void *STUB_API SteamInternal_ContextInit(void *pData) {
  ContextInitData *d = (ContextInitData *)pData;
  void *ctx;
  if (!d) return iface_ptr();
  ctx = (void *)((char *)d + sizeof(ContextInitData));
  if (d->counter != g_init_counter) {
    if (d->pFn) d->pFn(ctx);
    d->counter = g_init_counter;
  }
  return ctx;
}

void *STUB_API SteamInternal_CreateInterface(const char *ver) {
  (void)ver;
  return iface_ptr();
}
void *STUB_API SteamInternal_FindOrCreateUserInterface(void *hUser, const char *ver) {
  (void)hUser;
  (void)ver;
  return iface_ptr();
}

/* ESteamAPIInitResult: OK = 0 */
int STUB_API SteamInternal_SteamAPI_Init(const char *versions, void *errMsg) {
  (void)versions;
  (void)errMsg;
  OutputDebugStringA("[ISAAC_STUB] SteamInternal_SteamAPI_Init OK (offline)\n");
  ensure_iface();
  g_init_counter++;
  return k_ESteamAPIInitResult_OK;
}

int STUB_API SteamAPI_IsSteamRunning(void) { return 1; }
void STUB_API SteamAPI_ReleaseCurrentThreadMemory(void) {}
