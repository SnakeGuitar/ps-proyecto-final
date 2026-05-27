using frontendnet.Models;

namespace frontendnet.Services;

public class CarritoClientService(HttpClient client)
{
    public async Task<List<CarritoItem>?> GetAsync()
    {
        return await client.GetFromJsonAsync<List<CarritoItem>>("api/carrito");
    }

    public async Task PostAsync(int productoid, int cantidad = 1)
    {
        var response = await client.PostAsJsonAsync("api/carrito", new { productoid, cantidad });
        response.EnsureSuccessStatusCode();
    }

    public async Task PutAsync(int id, int cantidad)
    {
        var response = await client.PutAsJsonAsync($"api/carrito/{id}", new { cantidad });
        response.EnsureSuccessStatusCode();
    }

    public async Task DeleteAsync(int id)
    {
        var response = await client.DeleteAsync($"api/carrito/{id}");
        response.EnsureSuccessStatusCode();
    }

    public async Task<CheckoutResult?> CheckoutAsync()
    {
        var response = await client.PostAsJsonAsync("api/carrito/checkout", new { });
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<CheckoutResult>();
    }
}

public class CheckoutResult
{
    public int PedidoId { get; set; }
    public decimal Total { get; set; }
}
