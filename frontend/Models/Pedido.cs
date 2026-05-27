using System.ComponentModel.DataAnnotations;

namespace frontendnet.Models;

public class Pedido
{
    [Display(Name = "Id")]
    public int? PedidoId { get; set; }

    [Display(Name = "Usuario")]
    public string? UsuarioEmail { get; set; }

    [Display(Name = "Total")]
    [DataType(DataType.Currency)]
    [DisplayFormat(DataFormatString = "{0:C}")]
    public decimal Total { get; set; }

    [Display(Name = "Estado")]
    public string Estado { get; set; } = "pendiente";

    [Display(Name = "Fecha")]
    [DataType(DataType.DateTime)]
    public DateTime? CreatedAt { get; set; }

    public List<PedidoItem>? Items { get; set; }
}
