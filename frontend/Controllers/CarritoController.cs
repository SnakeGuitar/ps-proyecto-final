using frontendnet.Models;
using frontendnet.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace frontendnet;

[Authorize(Roles = "Usuario")]
public class CarritoController(CarritoClientService carrito, IConfiguration configuration) : Controller
{
    public async Task<IActionResult> Index()
    {
        List<CarritoItem>? lista = [];
        try
        {
            lista = await carrito.GetAsync();
        }
        catch (HttpRequestException ex)
        {
            if (ex.StatusCode == System.Net.HttpStatusCode.Unauthorized)
                return RedirectToAction("Salir", "Auth");
        }
        ViewBag.Url = configuration["URLWebAPI"];
        return View(lista);
    }

    [HttpPost]
    public async Task<IActionResult> Agregar(int productoid, string? returnUrl)
    {
        try
        {
            await carrito.PostAsync(productoid);
        }
        catch (HttpRequestException ex)
        {
            if (ex.StatusCode == System.Net.HttpStatusCode.Unauthorized)
                return RedirectToAction("Salir", "Auth");
        }
        return Redirect(returnUrl ?? "/Carrito");
    }

    [HttpPost]
    public async Task<IActionResult> Actualizar(int id, int cantidad)
    {
        try
        {
            if (cantidad < 1)
                await carrito.DeleteAsync(id);
            else
                await carrito.PutAsync(id, cantidad);
        }
        catch (HttpRequestException ex)
        {
            if (ex.StatusCode == System.Net.HttpStatusCode.Unauthorized)
                return RedirectToAction("Salir", "Auth");
        }
        return RedirectToAction("Index");
    }

    [HttpPost]
    public async Task<IActionResult> Eliminar(int id)
    {
        try
        {
            await carrito.DeleteAsync(id);
        }
        catch (HttpRequestException ex)
        {
            if (ex.StatusCode == System.Net.HttpStatusCode.Unauthorized)
                return RedirectToAction("Salir", "Auth");
        }
        return RedirectToAction("Index");
    }

    [HttpPost]
    public async Task<IActionResult> Checkout()
    {
        try
        {
            var result = await carrito.CheckoutAsync();
            return RedirectToAction("Detalle", "Pedidos", new { id = result!.PedidoId });
        }
        catch (HttpRequestException ex)
        {
            if (ex.StatusCode == System.Net.HttpStatusCode.Unauthorized)
                return RedirectToAction("Salir", "Auth");
            TempData["Error"] = "No se pudo procesar el pedido. Verifica que el carrito no esté vacío.";
            return RedirectToAction("Index");
        }
    }
}
