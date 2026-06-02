
package com.artesanos.sistema_pedidos.services;

import com.artesanos.sistema_pedidos.dtos.ProductoDetalleDto;
import com.artesanos.sistema_pedidos.entities.Pedido;
import com.artesanos.sistema_pedidos.enums.EstadoPedido;
import com.artesanos.sistema_pedidos.enums.MetodoPago;
import com.artesanos.sistema_pedidos.repositories.PedidoRepository;
import com.github.anastaciocintra.escpos.EscPos;
import com.github.anastaciocintra.escpos.EscPosConst;
import com.github.anastaciocintra.escpos.Style;
import com.github.anastaciocintra.escpos.image.*;
import com.github.anastaciocintra.output.TcpIpOutputStream;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.Map;
import java.text.NumberFormat;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.Locale;
import java.util.NoSuchElementException;
import java.util.Objects;

@Service
public class networkPrinterService {

    private static final Logger log = LoggerFactory.getLogger(networkPrinterService.class);
    private final ResourceLoader resourceLoader;
    private final PedidoRepository pedidoRepository;

    private static final int PRINTER_CHAR_WIDTH = 48;
    private final Style boldCenter = new Style().setBold(true).setFontSize(Style.FontSize._1, Style.FontSize._1)
            .setJustification(EscPosConst.Justification.Center);
    private final Style boldLeft = new Style().setBold(true);
    private final Style boldCenterBig = new Style().setFontSize(Style.FontSize._1, Style.FontSize._2).setBold(true)
            .setJustification(EscPosConst.Justification.Center);
    private final Style normal = new Style().setFontSize(Style.FontSize._1, Style.FontSize._1);

    public networkPrinterService(ResourceLoader resourceLoader, PedidoRepository pedidoRepository) {
        this.resourceLoader = resourceLoader;
        this.pedidoRepository = pedidoRepository;
    }

    public void imprimirFactura(Map<String, Object> data, String ipImpresora) throws IOException {
        log.info("[IMPRIMIR_FACTURA] Iniciando trabajo - IP: {}, PedidoID: {}", ipImpresora, data.get("id"));
        try (TcpIpOutputStream outputStream = new TcpIpOutputStream(ipImpresora, 9100);
                EscPos escpos = new EscPos(outputStream)) {

            log.debug("[IMPRIMIR_FACTURA] Conexion TCP abierta exitosamente a {}", ipImpresora);
            printLogo(escpos);

            escpos.writeLF(boldCenter, "Pedido #" + data.getOrDefault("id", ""));

            imprimirEncabezadoComun(escpos, data);

            String cabecera = format3ColumnsMultiLineInvoice("CANT", "PRODUCTO", "TOTAL", PRINTER_CHAR_WIDTH).get(0);
            escpos.writeLF(boldLeft, cabecera);
            escpos.writeLF("------------------------------------------------");

            @SuppressWarnings("unchecked")
            List<ProductoDetalleDto> productos = (List<ProductoDetalleDto>) data.get("pedido");

            if (productos != null) {
                for (ProductoDetalleDto prod : productos) {
                    String cant = prod.getCantidadProducto() != null ? String.valueOf(prod.getCantidadProducto()) : "1";
                    String nombre = prod.getNombreProducto() != null ? prod.getNombreProducto() : "Producto";

                    Integer subtotalRaw = prod.getSubtotalPedido() != null ? prod.getSubtotalPedido() : 0;
                    String subtotalFormateado = "$" + formatCurrency(subtotalRaw);

                    List<String> lineasProducto = format3ColumnsMultiLineInvoice(cant, nombre, subtotalFormateado,
                            PRINTER_CHAR_WIDTH);

                    for (String linea : lineasProducto) {
                        escpos.writeLF(normal, linea);
                    }

                }
            }
            escpos.writeLF("------------------------------------------------");

            Integer totalRaw = (Integer) data.getOrDefault("total", 0);
            String totalFormateado = formatCurrency(totalRaw);

            String totalFormat = padLeft("TOTAL: $" + totalFormateado, PRINTER_CHAR_WIDTH);
            escpos.writeLF(new Style().setBold(true), totalFormat);
            finalizarTicket(escpos, "Gracias por su compra");
            log.info("[IMPRIMIR_FACTURA] Trabajo completado exitosamente - IP: {}, PedidoID: {}", ipImpresora, data.get("id"));

        } catch (Exception e) {
            log.error("[IMPRIMIR_FACTURA] Error en impresion - IP: {}, PedidoID: {}, Error: {}", ipImpresora, data.get("id"), e.getMessage());
            throw new IOException("Fallo en la impresión: " + e.getMessage(), e);
        }
    }

    public void imprimirCocina(Map<String, Object> data, String ipImpresora) throws IOException {
        log.info("[IMPRIMIR_COCINA] Iniciando trabajo - IP: {}, PedidoID: {}", ipImpresora, data.get("id"));
        try (TcpIpOutputStream outputStream = new TcpIpOutputStream(ipImpresora, 9100);
            EscPos escpos = new EscPos(outputStream)) {
        
        Style normalCocinaStyle = new Style().setFontSize(Style.FontSize._1, Style.FontSize._2);
        Style resaltadoStyle = new Style()
                .setFontSize(Style.FontSize._1, Style.FontSize._2)
                .setColorMode(Style.ColorMode.WhiteOnBlack)
                .setBold(true);

        @SuppressWarnings("unchecked")
        List<ProductoDetalleDto> productos = (List<ProductoDetalleDto>) data.get("pedido");

        boolean imprimirDoble = false;
        if (productos != null) {
            imprimirDoble = productos.stream().anyMatch(prod -> {
                if (prod.getNombreProducto() == null) return false;
                String nombreLower = prod.getNombreProducto().toLowerCase();
                return !nombreLower.startsWith("pizza") 
                    && !nombreLower.startsWith("lasaña") 
                    && !nombreLower.startsWith("adicion");
            });
        }

        int repeticiones = imprimirDoble ? 2 : 1;

        for (int i = 0; i < repeticiones; i++) {
            
            if (i == 1) {
                escpos.writeLF(new Style().setBold(true), "*** COPIA ***");
            }

            printLogo(escpos);

            escpos.writeLF(boldCenter, "Pedido #" + data.getOrDefault("id", ""));
            imprimirEncabezadoComun(escpos, data);

            String cabecera = format3ColumnsMultiLineKitchen("CANT", "PRODUCTO", "PETICION", PRINTER_CHAR_WIDTH).get(0);
            escpos.writeLF(boldLeft, cabecera);
            escpos.writeLF("------------------------------------------------");

            if (productos != null && !productos.isEmpty()) {

                LocalDateTime fechaMayor = productos.stream()
                        .map(ProductoDetalleDto::getFechaModificacion)
                        .filter(Objects::nonNull)
                        .max(Comparator.naturalOrder())
                        .orElse(null);

                LocalDateTime fechaMenor = productos.stream()
                        .map(ProductoDetalleDto::getFechaModificacion)
                        .filter(Objects::nonNull)
                        .min(Comparator.naturalOrder())
                        .orElse(null);

                boolean debeResaltar = fechaMayor != null && fechaMenor != null && !fechaMayor.equals(fechaMenor);

                for (ProductoDetalleDto prod : productos) {
                    String cant = prod.getCantidadProducto() != null ? String.valueOf(prod.getCantidadProducto()) : "1";
                    
                    String nombre = prod.getNombreProducto() != null ? prod.getNombreProducto() : "Producto";
                    if (nombre.toLowerCase().startsWith("pizza ")) {
                        nombre = nombre.substring(6).trim(); 
                    } else if (nombre.toLowerCase().equals("pizza")) {
                        nombre = ""; 
                    }

                    String peticion = (prod.getPeticionCliente() != null && !prod.getPeticionCliente().isBlank())
                            ? prod.getPeticionCliente()
                            : "";

                    List<String> lineasProducto = format3ColumnsMultiLineKitchen(cant, nombre, peticion,
                            PRINTER_CHAR_WIDTH);

                    boolean esModificado = debeResaltar
                            && prod.getFechaModificacion() != null
                            && prod.getFechaModificacion().equals(fechaMayor);

                    Style estiloAUsar = esModificado ? resaltadoStyle : normalCocinaStyle;

                    if (esModificado) {
                        escpos.writeLF(normalCocinaStyle, " ");
                    }

                    for (String linea : lineasProducto) {
                        escpos.writeLF(estiloAUsar, linea);
                    }
                }
            }
            escpos.writeLF("------------------------------------------------");
            
            if (i == 0 && repeticiones == 2) {
                finalizarTicket(escpos, "Fin comanda (1/2)");
            } else {
                finalizarTicket(escpos, "Fin comanda");
            }
        }
        log.info("[IMPRIMIR_COCINA] Trabajo completado exitosamente - IP: {}, PedidoID: {}", ipImpresora, data.get("id"));

    } catch (Exception e) {
        log.error("[IMPRIMIR_COCINA] Error en impresion - IP: {}, PedidoID: {}, Error: {}", ipImpresora, data.get("id"), e.getMessage());
        throw new IOException("Fallo en la impresión: " + e.getMessage(), e);
    }
}

    public void imprimirCierreDelDia(String ipImpresora) throws IOException {
    log.info("[IMPRIMIR_CIERRE] Iniciando trabajo de cierre - IP: {}", ipImpresora);

    LocalDate hoy = LocalDate.now(ZoneId.of("America/Bogota"));
    LocalDateTime inicio = hoy.atStartOfDay();
    LocalDateTime fin = inicio.plusDays(1);

    List<Pedido> pedidos = pedidoRepository.findByFechaPedidoBetweenWithPagos(inicio, fin, EstadoPedido.RESUELTO);

    if (pedidos == null || pedidos.isEmpty()) {
        log.warn("[IMPRIMIR_CIERRE] No hay pedidos resueltos para hoy ({})", hoy);
        throw new NoSuchElementException("No hay pedidos resueltos en el dia actual para imprimir el cierre");
    }

    EnumMap<MetodoPago, Integer> totalesPorMetodo = new EnumMap<>(MetodoPago.class);
    for (MetodoPago m : MetodoPago.values()) {
        totalesPorMetodo.put(m, 0);
    }
    int totalGeneral = 0;

    for (Pedido p : pedidos) {
        if (p.getPagos() != null) {
            for (var pago : p.getPagos()) {
                Integer monto = pago.getMonto() != null ? pago.getMonto() : 0;
                totalesPorMetodo.merge(pago.getMetodoPago(), monto, Integer::sum);
                totalGeneral += monto;
            }
        }
    }

    int totalPedidos = pedidos.size();

    try (TcpIpOutputStream outputStream = new TcpIpOutputStream(ipImpresora, 9100);
            EscPos escpos = new EscPos(outputStream)) {

        log.debug("[IMPRIMIR_CIERRE] Conexion TCP abierta exitosamente a {}", ipImpresora);

        printLogo(escpos);

        escpos.writeLF(boldCenter, "CIERRE DE CAJA");
        escpos.writeLF("================================");
        escpos.feed(1);

        DateTimeFormatter fechaFmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        DateTimeFormatter horaFmt = DateTimeFormatter.ofPattern("HH:mm");
        String fechaStr = hoy.format(fechaFmt);
        String horaStr = LocalDateTime.now(ZoneId.of("America/Bogota")).format(horaFmt);

        escpos.writeLF(normal, "Fecha:    " + fechaStr);
        escpos.writeLF(normal, "Hora:     " + horaStr);
        escpos.writeLF("--------------------------------");
        escpos.writeLF(boldLeft, "Pedidos del dia: " + totalPedidos);
        escpos.writeLF("--------------------------------");
        escpos.writeLF(boldLeft, "Por metodo de pago:");
        escpos.feed(1);

        for (MetodoPago m : MetodoPago.values()) {
            String nombre = m.name();
            String monto = "$" + formatCurrency(totalesPorMetodo.get(m));
            String linea = padRight(nombre, PRINTER_CHAR_WIDTH - 12) + padLeft(monto, 12);
            escpos.writeLF(normal, linea);
        }

        escpos.writeLF("--------------------------------");
        String totalStr = "TOTAL: $" + formatCurrency(totalGeneral);
        escpos.writeLF(new Style().setBold(true), padLeft(totalStr, PRINTER_CHAR_WIDTH));
        escpos.writeLF("================================");

        finalizarTicket(escpos, "Cierre generado correctamente");

        log.info("[IMPRIMIR_CIERRE] Trabajo completado - IP: {}, Pedidos: {}, Total: {}",
                ipImpresora, totalPedidos, totalGeneral);

    } catch (NoSuchElementException e) {
        throw e;
    } catch (Exception e) {
        log.error("[IMPRIMIR_CIERRE] Error en impresion - IP: {}, Error: {}", ipImpresora, e.getMessage());
        throw new IOException("Fallo en la impresión del cierre: " + e.getMessage(), e);
    }
}

    private void printLogo(EscPos escpos) throws IOException {
        Resource resource = resourceLoader.getResource("classpath:static/images/artesanosFactura.jpg");

        try (InputStream is = resource.getInputStream()) {
            BufferedImage originalImage = ImageIO.read(is);

            int targetWidth = 300;
            BufferedImage resized = resizeImage(originalImage, targetWidth);

            Bitonal algorithm = new BitonalThreshold(127);
            EscPosImage escposImage = new EscPosImage(new CoffeeImageImpl(resized), algorithm);

            RasterBitImageWrapper imageWrapper = new RasterBitImageWrapper();
            imageWrapper.setJustification(EscPosConst.Justification.Center);

            escpos.write(imageWrapper, escposImage);
            escpos.feed(1);
        }
    }

    private BufferedImage resizeImage(BufferedImage original, int targetWidth) {
        int width = (targetWidth / 8) * 8;
        int height = (int) ((double) original.getHeight() / original.getWidth() * width);

        BufferedImage resized = new BufferedImage(width, height, BufferedImage.TYPE_BYTE_GRAY);
        Graphics2D g2d = resized.createGraphics();
        g2d.setColor(Color.WHITE);
        g2d.fillRect(0, 0, width, height);
        g2d.drawImage(original, 0, 0, width, height, null);
        g2d.dispose();
        return resized;
    }

    private void imprimirEncabezadoComun(EscPos escpos, Map<String, Object> data) throws IOException {
        if (data.get("mesa") != null)
            escpos.writeLF(boldCenterBig, "Mesa: " + data.get("mesa"));
        if (data.get("nombreDomicilio") != null && !data.get("nombreDomicilio").toString().isBlank()) {
            if (data.get("numeroCliente")!=null) {
                escpos.writeLF(boldCenter, "Teléfono: " + data.get("numeroCliente"));
            }
            escpos.write("");
            escpos.writeLF(boldCenterBig, "Domicilio: " + data.get("nombreDomicilio"));
        }

        escpos.writeLF("------------------------------------------------");
    }

    private void finalizarTicket(EscPos escpos, String mensaje) throws IOException {
        escpos.feed(1);
        escpos.writeLF(boldCenter, mensaje);
        escpos.feed(5);
        escpos.cut(EscPos.CutMode.FULL);
    }

    private String formatCurrency(Integer monto) {
        if (monto == null)
            return "0";
        NumberFormat formatter = NumberFormat.getNumberInstance(new Locale("es", "CO"));
        return formatter.format(monto);
    }

    private List<String> format3ColumnsMultiLineInvoice(String cant, String desc, String total, int totalWidth) {
        int cantWidth = 5;
        int totalWidthCol = 12;
        int descWidth = totalWidth - cantWidth - totalWidthCol;

        List<String> lines = new ArrayList<>();

        List<String> descLines = splitTextIntoLines(desc != null ? desc : "", descWidth - 1);

        for (int i = 0; i < descLines.size(); i++) {
            String c1 = (i == 0) ? padRight(cant, cantWidth) : padRight("", cantWidth);
            String c2 = padRight(descLines.get(i), descWidth);
            String c3 = (i == 0) ? padLeft(total, totalWidthCol) : padLeft("", totalWidthCol);

            lines.add(c1 + c2 + c3);
        }

        return lines;
    }

    private List<String> format3ColumnsMultiLineKitchen(String cant, String desc, String peticion, int totalWidth) {
        int cantWidth = 5;
        int peticionWidthCol = 16;
        int descWidth = totalWidth - cantWidth - peticionWidthCol;

        List<String> lines = new ArrayList<>();
        List<String> descLines = splitTextIntoLines(desc != null ? desc : "", descWidth - 1);
        List<String> peticionLines = splitTextIntoLines(peticion != null ? peticion : "", peticionWidthCol - 1);

        int maxLines = Math.max(descLines.size(), peticionLines.size());
        for (int i = 0; i < maxLines; i++) {
            String c1 = (i == 0) ? padRight(cant, cantWidth) : padRight("", cantWidth);
            String currentDesc = (i < descLines.size()) ? descLines.get(i) : "";
            String c2 = padRight(currentDesc, descWidth);
            String currentPeticion = (i < peticionLines.size()) ? peticionLines.get(i) : "";
            String c3 = padRight(currentPeticion, peticionWidthCol);

            lines.add(c1 + c2 + c3);
        }

        return lines;
    }

    private List<String> splitTextIntoLines(String text, int maxLength) {
        List<String> result = new ArrayList<>();
        if (text == null || text.isEmpty()) {
            result.add("");
            return result;
        }

        String[] words = text.split(" ");
        StringBuilder currentLine = new StringBuilder();

        for (String word : words) {
            if (currentLine.length() + word.length() + 1 > maxLength) {
                if (currentLine.length() > 0) {
                    result.add(currentLine.toString());
                    currentLine = new StringBuilder();
                }
                while (word.length() > maxLength) {
                    result.add(word.substring(0, maxLength));
                    word = word.substring(maxLength);
                }
            }
            if (currentLine.length() > 0) {
                currentLine.append(" ");
            }
            currentLine.append(word);
        }
        if (currentLine.length() > 0) {
            result.add(currentLine.toString());
        }
        return result;
    }

    private String padRight(String s, int n) {
        if (s == null)
            s = "";
        if (s.length() >= n)
            return s.substring(0, n);
        return String.format("%-" + n + "s", s);
    }

    private String padLeft(String s, int n) {
        if (s == null)
            s = "";
        if (s.length() >= n)
            return s.substring(0, n);
        return String.format("%" + n + "s", s);
    }
}