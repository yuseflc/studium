/* Archivo: src\lib\utils\avatar.ts
   Descripción: Utilidad para resolver la URL del avatar de un usuario. */

/**
 * Devuelve la URL del avatar de un usuario:
 * - Si tiene cuenta de Google vinculada, usa su foto de perfil de Google.
 * - En caso contrario, genera un avatar único con Robohash basado en su _id.
 */
export function getUserAvatarUrl(user: {
  _id?: string | { toString(): string };
  thirdparty?: Array<{ provider: string; profilePicture?: string }> | null;
}): string {
  const googleAccount = user.thirdparty?.find((t) => t.provider === "google");
  if (googleAccount?.profilePicture) {
    return googleAccount.profilePicture;
  }
  const id = user._id ? String(user._id) : "unknown";
  return `https://robohash.org/${id}?set=set5`;
}
