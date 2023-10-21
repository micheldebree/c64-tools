// N.B. this is based on Petmate and uses 1:1 for petmate files

export interface ScreenCell {
  code: number
  color: number
}

export interface Screen {
  id: string
  backgroundColor: number
  cells: ScreenCell[]
}
