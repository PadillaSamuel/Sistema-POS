import { TableCell, TableRow } from '@/components/ui/table'

const FilaPedido = ({ nombre, cantidad, precio, subtotal }) => {
  return (
    <TableRow>
      <TableCell>{nombre}</TableCell>
      <TableCell className="text-center tabular-nums">{cantidad}</TableCell>
      <TableCell className="text-center tabular-nums">{precio}</TableCell>
      <TableCell className="text-center tabular-nums">{subtotal}</TableCell>
    </TableRow>
  )
}

export default FilaPedido
