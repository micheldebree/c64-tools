set nolist
set fdm=syntax
set fdl=999
" nmap <F5> :!go run *.go<CR>
nmap <F5> :wa<cr>:make<cr> <bar> cw<cr>
