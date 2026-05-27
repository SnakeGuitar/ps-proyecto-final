using System.ComponentModel.DataAnnotations;

namespace frontendnet.Models;

public class PedidoItem
{
    public int? PedidoItemId { get; set; }
    public int? ProductoId { get; set; }

    [Display(Name = "Producto")]
    public string Titulo { get; set; } = string.Empty;

    [Display(Name = "Precio")]
    [DataType(DataType.Currency)]
    [DisplayFormat(DataFormatString = "{0:C}")]
    public decimal Precio { get; set; }

    [Display(Name = "Cantidad")]
    public int Cantidad { get; set; }
}
