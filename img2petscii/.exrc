set makeprg=make
au BufNewFile,BufRead *.petmate set ft=json

let g:ale_linters = {'javascript': ['standard'], 'typescript': ['eslint']}
let g:ale_fixers = {'javascript': ['standard'], 'json': ['jq'], 'typescript': ['prettier','eslint'] }
