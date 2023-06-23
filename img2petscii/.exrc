set makeprg=make
au BufNewFile,BufRead *.petmate set ft=json
au BufNewFile,BufRead,BufEnter *.ts set ft=typescript
" au BufNewFile,BufRead *.ts CocOutline

let g:ale_linters = {'javascript': ['standard'], 'typescript': ['eslint']}
let g:ale_fixers = {'javascript': ['standard'], 'json': ['jq'], 'typescript': ['prettier','eslint'] }
