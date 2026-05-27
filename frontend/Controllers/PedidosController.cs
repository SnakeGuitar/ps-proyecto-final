using frontendnet.Models;
using frontendnet.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace frontendnet;

[Authorize(Roles = "Usuario,Administrador")]
public class PedidosController(PedidosClientService pedidos) : Controller
{
    public async Task<IActionResult> Index()
    {
        List<Pedido>? lista = [];
        try
        {
            lista = await pedidos.GetAsync();
        }
        catch (HttpRequestException ex)
        {
            if (ex.StatusCode == System.Net.HttpStatusCode.Unauthorized)
                return RedirectToAction("Salir", "Auth");
        }
        return View(lista);
    }

    public async Task<IActionResult> Detalle(int id)
    {
        Pedido? pedido = null;
        try
        {
            pedido = await pedidos.GetAsync(id);
        }
        catch (HttpRequestException ex)
        {
            if (ex.StatusCode == System.Net.HttpStatusCode.Unauthorized)
                return RedirectToAction("Salir", "Auth");
            if (ex.StatusCode == System.Net.HttpStatusCode.Forbidden)
                return RedirectToAction("AccessDenied", "Home");
        }
        if (pedido == null) return NotFound();
        return View(pedido);
    }
}
