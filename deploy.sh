

set -o nounset
set -o errexit

REMOTE_DIR="/usr/local/oct/oeos/app/KS02/front/tenant/tenant"

if [[ "$#" != 0 && "$1" == "-k" ]]; then
    echo
else
    npm run build
fi

for i in {33..35};do
# for i in 33;do
   ssh  root@10.0.11."$i" <<EOF
   rm -rf $REMOTE_DIR
EOF
   scp -r ./tenant root@10.0.11."$i":$REMOTE_DIR
   ssh root@10.0.11."$i" systemctl restart nginx
done
