using System.ComponentModel.DataAnnotations;

namespace frontendnet.Models;

public class Archivo
{
    [Display(Name = "Id")]
    public int? ArchivoId { get; set; }

    [Display(Name = "MIME")]
    public string? Mime { get; set; }

    public string? Nombre { get; set; }

    [Display(Name = "Tamprecio")]
    public int? Size { get; set; }

    [Display(Name = "Repositorio")]
    public bool InDb { get; set; } = true;
}
