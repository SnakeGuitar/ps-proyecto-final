namespace frontendnet.Models;

public class CarritoItem
{
    public int? CarritoItemId { get; set; }
    public int ProductoId { get; set; }
    public int Cantidad { get; set; } = 1;
    public decimal Precio { get; set; }
    public Producto? Producto { get; set; }
}
