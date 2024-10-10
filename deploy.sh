

set -o nounset
set -o errexit

if [[ "$#" != 0 && "$1" == "-k" ]]; then
    echo
else
    npm run build
fi

for i in {33..35};do
# for i in 33;do
   ssh  root@10.0.11."$i" <<EOF
   rm -rf /opt/newfront/tenant
EOF
   scp -r ./tenant/* root@10.0.11."$i":/opt/newfront/tenant
   ssh root@10.0.11."$i" systemctl restart nginx
done
