using Microsoft.Extensions.Hosting;

var builder = WebApplication.CreateBuilder(args);
// Detectar si está corriendo como un servicio de Windows
builder.Host.UseWindowsService();

//Defino quien consumira el servicio
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.AllowAnyOrigin()
        .AllowAnyHeader()
        .AllowAnyMethod();
    });
});

// Add services to the container.
builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.WebHost.ConfigureKestrel(options =>
{
    options.ListenAnyIP(5075);
   // options.ListenAnyIP(5106);// puerto de Swagger
});
var app = builder.Build();

//configuramos puerto personalizado
app.Urls.Add("http://localhost:5075");

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
//aplicamos politicas de cords
app.UseCors("AllowReactApp");

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
