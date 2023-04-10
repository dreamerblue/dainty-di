rm -rf dist
tsc
files=$(find dist/*.js)
while read -r line; do
  esbuild $line --outfile=$line --allow-overwrite --minify --platform=node --format=cjs --target=es2015
done <<< "$files"
