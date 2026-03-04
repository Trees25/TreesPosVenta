using System.Drawing.Printing;
using System.Net.Sockets;
using System.Net;
using Microsoft.AspNetCore.Mvc;
using Spire.Pdf;
namespace printservice.Controllers
{
    [ApiController]
    [Route("api")]
    public class PrinterController : ControllerBase
    {
        private readonly ILogger<PrinterController> _logger;
        public PrinterController(ILogger<PrinterController> logger)
            
        {
            _logger = logger;
        }
        [HttpGet("list")]
        public IActionResult GetPrinters()
        {
            try
            {
                // Obtener la lista de impresoras instaladas
                var printers = PrinterSettings.InstalledPrinters
                    .Cast<string>()
                    .Select(printer =>new {name=printer})
                    .ToList();
                if (printers.Count == 0)
                {
                    return NotFound("No se encontraron impresoras instaladas.");
                }
                return Ok(printers);
            }
            catch (Exception ex)
            {

                _logger.LogError(ex, "Error al obtener la lista de impresoras.");
                return StatusCode(500, "Error interno del servidor al listar impresoras.");
            }
        }
        [HttpGet("get-local-ip")]
        public IActionResult GetLocalIP()
        {
            var hostName =Dns.GetHostName();// Nombre de la PC
            var localIP = Dns.GetHostAddresses(hostName)
                .Where(ip => ip.AddressFamily == AddressFamily.InterNetwork)//solo IPv4
                .Select(ip => ip.ToString());
            return Ok(new
            {
                machineName =hostName,
                localIPs=localIP
            });
        }        


        [HttpPost("print-ticket")]
        public IActionResult PrintTicket(IFormFile file, [FromForm] string printerName)
        {
            try
            {
                if (file == null || file.Length == 0)
                {
                    return BadRequest("No se envió ningún archivo.");
                }
                if (string.IsNullOrEmpty(printerName))
                {
                    return BadRequest("No se ingreso nombre de impresora");
                }
                // Guardar temporalmente el archivo
                var tempFilePath = Path.Combine(Path.GetTempPath(),$"{Guid.NewGuid()}.pdf ");
                using (var stream = new FileStream(tempFilePath, FileMode.Create))
                {
                    file.CopyTo(stream);
                }
                // Cargar el PDF
                var pdfDocument = new PdfDocument();
                pdfDocument.LoadFromFile(tempFilePath);
                // Configurar la impresora
                pdfDocument.PrintSettings.PrinterName = printerName;
                pdfDocument.PrintSettings.SelectPageRange(1, pdfDocument.Pages.Count);
                pdfDocument.PrintSettings.SelectSinglePageLayout(Spire.Pdf.Print.PdfSinglePageScalingMode.FitSize);
                // Enviar a imprimir
                pdfDocument.Print();
                // Liberar recursos
                pdfDocument.Close();
                // Eliminar el archivo temporal
                System.IO.File.Delete(tempFilePath);
                return Ok("PDF enviado a imprimir correctamente.");

            }
            catch (Exception ex)
            {

                return StatusCode(500, $"Error al imprimir el PDF: {ex.Message}");
            }
        }
       


    }
}
