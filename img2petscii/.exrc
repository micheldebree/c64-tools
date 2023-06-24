set makeprg=make
au BufNewFile,BufRead *.petmate set ft=json
au BufNewFile,BufRead,BufEnter *.ts set ft=typescript
" au BufNewFile,BufRead *.ts CocOutline
au VimLeave *.asm,*.js,Makefile mks!

let g:ale_linters = {'javascript': ['standard'], 'typescript': ['eslint'], 'markdown': ['markdownlint']}
let g:ale_fixers = {'javascript': ['standard'], 'json': ['jq'], 'typescript': ['prettier','eslint'], 'markdown': ['prettier'] }
