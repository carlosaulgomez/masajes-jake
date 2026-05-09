# Masajes Jacqueline

Sitio estatico con contenido editable desde Google Sheets.

## Hoja principal: terapias

La primera pestaña de la planilla (`gid=0`) carga las terapias.

Columnas:

```csv
id,nombre,duracion,precio,presion,descripcion,horarios,destacado,activo
```

Ejemplo:

```csv
desbloqueo-cervical,Desbloqueo cervical,80 min,CLP 54.000,Media a firme,Trabajo profundo en cuello y mandibula,10:30|15:00|18:30,si,si
```

## Pestañas opcionales

### Config

Columnas:

```csv
clave,valor
```

Claves soportadas:

```csv
dias_atencion,martes|miercoles|jueves|viernes
dias_texto,martes a viernes
horario_inicio,10:00
horario_fin,19:30
horario_texto,10:00 a 19:30
margen_minutos,45
whatsapp,56954147874
telefono,+56 9 5414 7874
direccion,Pasaje Tome, Peñaflor
mapa_query,Pasaje Tome, Peñaflor, Chile
hero_eyebrow,Masajes Jacqueline · Peñaflor
hero_titulo,Masajes en Peñaflor para aliviar cuello, espalda y estres.
hero_subtitulo,Sesiones terapeuticas y drenaje linfatico con reserva por WhatsApp.
```

### Bloqueos

Columnas:

```csv
fecha,motivo,activo
```

Formato de fecha aceptado: `2026-05-15` o `15/05/2026`.

### Testimonios

Columnas:

```csv
nombre,sector,texto,activo
```

### FAQ

Columnas:

```csv
pregunta,respuesta,activo
```

### Promos

Columnas:

```csv
titulo,descripcion,precio,detalle,destacado,activo
```

Si una pestaña opcional no existe o falla, la pagina usa contenido local de respaldo.
