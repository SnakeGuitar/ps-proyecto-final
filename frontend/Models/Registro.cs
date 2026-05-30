using System.ComponentModel.DataAnnotations;

namespace frontendnet.Models;

public class Registro
{
    [Required(ErrorMessage = "El campo {0} es obligatorio.")]
    [Display(Name = "Nombre completo")]
    public required string Nombre { get; set; }

    [Required(ErrorMessage = "El campo {0} es obligatorio.")]
    [EmailAddress(ErrorMessage = "El campo {0} no es un correo válido.")]
    [Display(Name = "Correo electrónico")]
    public required string Email { get; set; }

    [Required(ErrorMessage = "El campo {0} es obligatorio.")]
    [MinLength(8, ErrorMessage = "El campo {0} debe tener al menos 8 caracteres.")]
    [DataType(DataType.Password)]
    [Display(Name = "Contraseña")]
    public required string Password { get; set; }

    [Required(ErrorMessage = "El campo {0} es obligatorio.")]
    [DataType(DataType.Password)]
    [Display(Name = "Confirmar contraseña")]
    [Compare("Password", ErrorMessage = "Las contraseñas no coinciden.")]
    public required string ConfirmPassword { get; set; }
}
