rm -rf dist
tsc
files=$(find dist/*.js)
while read -r line; do
  esbuild $line --minify --allow-overwrite --outfile=$line --platform=node
done <<< "$files"
