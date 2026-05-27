using frontendnet.Models;

namespace frontendnet.Services;

public class PedidosClientService(HttpClient client)
{
    public async Task<List<Pedido>?> GetAsync()
    {
        return await client.GetFromJsonAsync<List<Pedido>>("api/pedidos");
    }

    public async Task<Pedido?> GetAsync(int id)
    {
        return await client.GetFromJsonAsync<Pedido>($"api/pedidos/{id}");
    }
}
