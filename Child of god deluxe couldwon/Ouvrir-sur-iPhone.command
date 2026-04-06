#!/bin/zsh
set -e

cd "$(dirname "$0")"

PORT="${1:-8080}"

IP="$(ipconfig getifaddr en0 2>/dev/null || true)"
if [ -z "$IP" ]; then
  IP="$(ipconfig getifaddr en1 2>/dev/null || true)"
fi
if [ -z "$IP" ]; then
  IP="$(ifconfig | awk '/inet / && $2 != "127.0.0.1" {print $2; exit}')"
fi

if [ -z "$IP" ]; then
  echo "Impossible de detecter l'IP locale."
  echo "Tu peux quand meme ouvrir: http://localhost:${PORT}/index.html"
  python3 -m http.server "$PORT" --bind 0.0.0.0
  exit 0
fi

URL="http://${IP}:${PORT}/index.html"

echo
echo "=============================================="
echo " Ouvre ce lien sur ton iPhone (meme Wi-Fi):"
echo " ${URL}"
echo "=============================================="
echo

if command -v pbcopy >/dev/null 2>&1; then
  printf "%s" "$URL" | pbcopy
  echo "Lien copie dans le presse-papiers."
  echo
fi

echo "Laisse cette fenetre ouverte pendant la visite."
echo "Ctrl + C pour arreter le serveur."
echo

python3 -m http.server "$PORT" --bind 0.0.0.0
