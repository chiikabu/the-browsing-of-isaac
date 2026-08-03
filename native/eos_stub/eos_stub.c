/* Soft-fail EOSSDK stub — offline PE boot under Wine/Boxedwine.
 * Exports stdcall-decorated names matching isaac-ng.exe imports.
 * Initialize/Create return success; interface getters return NULL; no network.
 */
#include <stdint.h>
#include <stddef.h>

#ifdef _WIN32
#define STDCALL __stdcall
#define EXPORT __declspec(dllexport)
#else
#define STDCALL
#define EXPORT
#endif

/* EOS_EResult: Success = 0 */
enum { EOS_Success = 0, EOS_NotConfigured = 19, EOS_InvalidParameters = 2 };

EXPORT int32_t STDCALL EOS_Initialize(void *options) {
  (void)options;
  return EOS_Success;
}
EXPORT void STDCALL EOS_Shutdown(void) {}
EXPORT const char *STDCALL EOS_EResult_ToString(int32_t r) {
  (void)r;
  return "EOS_Success";
}
EXPORT void *STDCALL EOS_Platform_Create(void *options) {
  (void)options;
  /* non-null opaque handle so callers don't immediate-null-deref before Tick */
  static int platform_handle = 1;
  return &platform_handle;
}
EXPORT void STDCALL EOS_Platform_Release(void *handle) { (void)handle; }
EXPORT void STDCALL EOS_Platform_Tick(void *handle) { (void)handle; }

EXPORT void *STDCALL EOS_Platform_GetLobbyInterface(void *h) {
  (void)h;
  return NULL;
}
EXPORT void *STDCALL EOS_Platform_GetPresenceInterface(void *h) {
  (void)h;
  return NULL;
}
EXPORT void *STDCALL EOS_Platform_GetAuthInterface(void *h) {
  (void)h;
  return NULL;
}
EXPORT void *STDCALL EOS_Platform_GetConnectInterface(void *h) {
  (void)h;
  return NULL;
}
EXPORT void *STDCALL EOS_Platform_GetP2PInterface(void *h) {
  (void)h;
  return NULL;
}
EXPORT void *STDCALL EOS_Platform_GetFriendsInterface(void *h) {
  (void)h;
  return NULL;
}
EXPORT void *STDCALL EOS_Platform_GetUserInfoInterface(void *h) {
  (void)h;
  return NULL;
}

/* Lobby */
EXPORT int32_t STDCALL EOS_Lobby_CreateLobby(void *a, void *b) {
  (void)a;
  (void)b;
  return EOS_NotConfigured;
}
EXPORT int32_t STDCALL EOS_Lobby_JoinLobby(void *a, void *b) {
  (void)a;
  (void)b;
  return EOS_NotConfigured;
}
EXPORT int32_t STDCALL EOS_Lobby_LeaveLobby(void *a, void *b) {
  (void)a;
  (void)b;
  return EOS_Success;
}
EXPORT int32_t STDCALL EOS_Lobby_UpdateLobby(void *a, void *b) {
  (void)a;
  (void)b;
  return EOS_NotConfigured;
}
EXPORT int32_t STDCALL EOS_Lobby_UpdateLobbyModification(void *a, void *b) {
  (void)a;
  (void)b;
  return EOS_NotConfigured;
}
EXPORT int32_t STDCALL EOS_Lobby_CreateLobbySearch(void *a, void *b) {
  (void)a;
  (void)b;
  return EOS_NotConfigured;
}
EXPORT int32_t STDCALL EOS_Lobby_CopyLobbyDetailsHandle(void *a, void *b) {
  (void)a;
  (void)b;
  return EOS_NotConfigured;
}
EXPORT int32_t STDCALL EOS_Lobby_CopyLobbyDetailsHandleByInviteId(void *a, void *b) {
  (void)a;
  (void)b;
  return EOS_NotConfigured;
}
EXPORT int32_t STDCALL EOS_Lobby_CopyLobbyDetailsHandleByUiEventId(void *a, void *b) {
  (void)a;
  (void)b;
  return EOS_NotConfigured;
}
EXPORT uint64_t STDCALL EOS_Lobby_AddNotifyLobbyInviteAccepted(void *a, void *b, void *c, void *d) {
  (void)a;
  (void)b;
  (void)c;
  (void)d;
  return 0;
}
EXPORT uint64_t STDCALL EOS_Lobby_AddNotifyJoinLobbyAccepted(void *a, void *b, void *c, void *d) {
  (void)a;
  (void)b;
  (void)c;
  (void)d;
  return 0;
}
EXPORT uint64_t STDCALL EOS_Lobby_AddNotifyLobbyMemberStatusReceived(void *a, void *b, void *c, void *d) {
  (void)a;
  (void)b;
  (void)c;
  (void)d;
  return 0;
}
EXPORT void STDCALL EOS_Lobby_RemoveNotifyLobbyMemberStatusReceived(void *a, uint64_t id) {
  (void)a;
  (void)id;
}

EXPORT void STDCALL EOS_LobbyModification_Release(void *h) { (void)h; }
EXPORT int32_t STDCALL EOS_LobbyModification_AddAttribute(void *a, void *b) {
  (void)a;
  (void)b;
  return EOS_Success;
}
EXPORT int32_t STDCALL EOS_LobbyModification_AddMemberAttribute(void *a, void *b) {
  (void)a;
  (void)b;
  return EOS_Success;
}
EXPORT int32_t STDCALL EOS_LobbyModification_RemoveAttribute(void *a, void *b) {
  (void)a;
  (void)b;
  return EOS_Success;
}
EXPORT int32_t STDCALL EOS_LobbyModification_RemoveMemberAttribute(void *a, void *b) {
  (void)a;
  (void)b;
  return EOS_Success;
}
EXPORT int32_t STDCALL EOS_LobbyModification_SetBucketId(void *a, void *b) {
  (void)a;
  (void)b;
  return EOS_Success;
}
EXPORT int32_t STDCALL EOS_LobbyModification_SetPermissionLevel(void *a, void *b) {
  (void)a;
  (void)b;
  return EOS_Success;
}

EXPORT void STDCALL EOS_LobbyDetails_Release(void *h) { (void)h; }
EXPORT void STDCALL EOS_LobbyDetails_Info_Release(void *h) { (void)h; }
EXPORT int32_t STDCALL EOS_LobbyDetails_CopyInfo(void *a, void *b) {
  (void)a;
  (void)b;
  return EOS_NotConfigured;
}
EXPORT int32_t STDCALL EOS_LobbyDetails_CopyAttributeByKey(void *a, void *b) {
  (void)a;
  (void)b;
  return EOS_NotConfigured;
}
EXPORT int32_t STDCALL EOS_LobbyDetails_CopyMemberAttributeByKey(void *a, void *b) {
  (void)a;
  (void)b;
  return EOS_NotConfigured;
}
EXPORT void *STDCALL EOS_LobbyDetails_GetLobbyOwner(void *a, void *b) {
  (void)a;
  (void)b;
  return NULL;
}
EXPORT void *STDCALL EOS_LobbyDetails_GetMemberByIndex(void *a, void *b) {
  (void)a;
  (void)b;
  return NULL;
}
EXPORT uint32_t STDCALL EOS_LobbyDetails_GetMemberCount(void *a, void *b) {
  (void)a;
  (void)b;
  return 0;
}

EXPORT void STDCALL EOS_LobbySearch_Release(void *h) { (void)h; }
EXPORT int32_t STDCALL EOS_LobbySearch_SetParameter(void *a, void *b) {
  (void)a;
  (void)b;
  return EOS_Success;
}
EXPORT int32_t STDCALL EOS_LobbySearch_SetLobbyId(void *a, void *b) {
  (void)a;
  (void)b;
  return EOS_Success;
}
EXPORT int32_t STDCALL EOS_LobbySearch_Find(void *a, void *b, void *c, void *d) {
  (void)a;
  (void)b;
  (void)c;
  (void)d;
  return EOS_NotConfigured;
}
EXPORT uint32_t STDCALL EOS_LobbySearch_GetSearchResultCount(void *a, void *b) {
  (void)a;
  (void)b;
  return 0;
}
EXPORT int32_t STDCALL EOS_LobbySearch_CopySearchResultByIndex(void *a, void *b) {
  (void)a;
  (void)b;
  return EOS_NotConfigured;
}
EXPORT void STDCALL EOS_Lobby_Attribute_Release(void *h) { (void)h; }

/* Auth / Connect / Presence */
EXPORT int32_t STDCALL EOS_Auth_Login(void *a, void *b) {
  (void)a;
  (void)b;
  return EOS_NotConfigured;
}
EXPORT int32_t STDCALL EOS_Auth_LinkAccount(void *a, void *b) {
  (void)a;
  (void)b;
  return EOS_NotConfigured;
}
EXPORT int32_t STDCALL EOS_Auth_CopyUserAuthToken(void *a, void *b, void *c, void *d) {
  (void)a;
  (void)b;
  (void)c;
  (void)d;
  return EOS_NotConfigured;
}
EXPORT void STDCALL EOS_Auth_Token_Release(void *h) { (void)h; }

EXPORT int32_t STDCALL EOS_Connect_Login(void *a, void *b) {
  (void)a;
  (void)b;
  return EOS_NotConfigured;
}
EXPORT int32_t STDCALL EOS_Connect_CreateUser(void *a, void *b) {
  (void)a;
  (void)b;
  return EOS_NotConfigured;
}
EXPORT uint64_t STDCALL EOS_Connect_AddNotifyAuthExpiration(void *a, void *b, void *c, void *d) {
  (void)a;
  (void)b;
  (void)c;
  (void)d;
  return 0;
}
EXPORT int32_t STDCALL EOS_Connect_QueryExternalAccountMappings(void *a, void *b) {
  (void)a;
  (void)b;
  return EOS_NotConfigured;
}
EXPORT int32_t STDCALL EOS_Connect_QueryProductUserIdMappings(void *a, void *b) {
  (void)a;
  (void)b;
  return EOS_NotConfigured;
}
EXPORT void *STDCALL EOS_Connect_GetExternalAccountMapping(void *a, void *b) {
  (void)a;
  (void)b;
  return NULL;
}
EXPORT int32_t STDCALL EOS_Connect_CopyProductUserInfo(void *a, void *b) {
  (void)a;
  (void)b;
  return EOS_NotConfigured;
}
EXPORT void STDCALL EOS_Connect_ExternalAccountInfo_Release(void *h) { (void)h; }

EXPORT int32_t STDCALL EOS_Presence_CreatePresenceModification(void *a, void *b) {
  (void)a;
  (void)b;
  return EOS_NotConfigured;
}
EXPORT int32_t STDCALL EOS_Presence_SetPresence(void *a, void *b) {
  (void)a;
  (void)b;
  return EOS_NotConfigured;
}
EXPORT int32_t STDCALL EOS_Presence_QueryPresence(void *a, void *b) {
  (void)a;
  (void)b;
  return EOS_NotConfigured;
}
EXPORT int32_t STDCALL EOS_Presence_HasPresence(void *a, void *b) {
  (void)a;
  (void)b;
  return 0;
}
EXPORT int32_t STDCALL EOS_Presence_CopyPresence(void *a, void *b) {
  (void)a;
  (void)b;
  return EOS_NotConfigured;
}
EXPORT void STDCALL EOS_Presence_Info_Release(void *h) { (void)h; }
EXPORT void STDCALL EOS_PresenceModification_Release(void *h) { (void)h; }
EXPORT int32_t STDCALL EOS_PresenceModification_SetData(void *a, void *b) {
  (void)a;
  (void)b;
  return EOS_Success;
}

/* P2P */
EXPORT int32_t STDCALL EOS_P2P_GetNextReceivedPacketSize(void *a, void *b, void *c) {
  (void)a;
  (void)b;
  (void)c;
  return EOS_NotConfigured;
}
EXPORT int32_t STDCALL EOS_P2P_ReceivePacket(void *a, void *b, void *c, void *d, void *e, void *f, void *g) {
  (void)a;
  (void)b;
  (void)c;
  (void)d;
  (void)e;
  (void)f;
  (void)g;
  return EOS_NotConfigured;
}
EXPORT int32_t STDCALL EOS_P2P_SendPacket(void *a, void *b) {
  (void)a;
  (void)b;
  return EOS_NotConfigured;
}

/* Friends / UserInfo */
EXPORT int32_t STDCALL EOS_Friends_QueryFriends(void *a, void *b) {
  (void)a;
  (void)b;
  return EOS_NotConfigured;
}
EXPORT int32_t STDCALL EOS_Friends_GetFriendsCount(void *a, void *b) {
  (void)a;
  (void)b;
  return 0;
}
EXPORT void *STDCALL EOS_Friends_GetFriendAtIndex(void *a, void *b) {
  (void)a;
  (void)b;
  return NULL;
}
EXPORT int32_t STDCALL EOS_Friends_GetBlockedUsersCount(void *a, void *b) {
  (void)a;
  (void)b;
  return 0;
}
EXPORT void *STDCALL EOS_Friends_GetBlockedUserAtIndex(void *a, void *b) {
  (void)a;
  (void)b;
  return NULL;
}
EXPORT uint64_t STDCALL EOS_Friends_AddNotifyFriendsUpdate(void *a, void *b, void *c, void *d) {
  (void)a;
  (void)b;
  (void)c;
  (void)d;
  return 0;
}
EXPORT uint64_t STDCALL EOS_Friends_AddNotifyBlockedUsersUpdate(void *a, void *b, void *c, void *d) {
  (void)a;
  (void)b;
  (void)c;
  (void)d;
  return 0;
}
EXPORT int32_t STDCALL EOS_UserInfo_QueryUserInfoByExternalAccount(void *a, void *b) {
  (void)a;
  (void)b;
  return EOS_NotConfigured;
}

EXPORT int32_t STDCALL EOS_EpicAccountId_IsValid(void *id) {
  (void)id;
  return 0;
}
EXPORT int32_t STDCALL EOS_EpicAccountId_ToString(void *id, char *out, int32_t *len) {
  (void)id;
  if (out && len && *len > 0) {
    out[0] = 0;
    *len = 0;
  }
  return EOS_Success;
}
EXPORT int32_t STDCALL EOS_ByteArray_ToString(const uint8_t *b, uint32_t len, char *out, uint32_t *outLen) {
  (void)b;
  (void)len;
  if (out && outLen && *outLen > 0) {
    out[0] = 0;
    *outLen = 0;
  }
  return EOS_Success;
}
