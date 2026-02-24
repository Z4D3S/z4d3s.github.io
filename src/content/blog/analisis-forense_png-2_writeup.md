---
author: yusnelgg
category: forensics
description: Análisis forense de imagen PNG sin metadatos aparentes
  donde se descubre información oculta mediante esteganografía LSB
  usando zsteg.
difficulty: medium
heroImage: /images/pico-flag-stego.avif
pubDate: 2026-02-23
tags:
- forensics
- picoctf
- steganography
- png
- zsteg
- lsb
title: Análisis Forense de imagen PNG - Writeup del Reto PicoCTF [St3g0]
---

## Introducción

En este reto se proporciona una imagen PNG denominada:

`pico.flag.png`

El objetivo consiste en determinar si la imagen contiene información
oculta y, en caso afirmativo, recuperar la flag.

A simple vista se trata de una imagen PNG válida sin contenido
sospechoso evidente. Sin embargo, en escenarios CTF y análisis forense
real, la ausencia de anomalías visibles no implica ausencia de
manipulación.

Este tipo de retos simula técnicas básicas de ocultación de información
mediante esteganografía.

------------------------------------------------------------------------

## Metodología de Análisis

Se siguió un enfoque estructurado y progresivo:

1.  Validación del tipo e integridad del archivo.
2.  Inspección de metadatos.
3.  Búsqueda de datos embebidos.
4.  Análisis específico de esteganografía.

------------------------------------------------------------------------

## Fase 0: Verificación del Tipo e Integridad del Archivo

El primer paso consistió en confirmar que el archivo fuera un PNG válido
y no un contenedor disfrazado.

### Validación con `pngcheck`

``` bash
pngcheck pico.flag.png
```

Resultado:

``` text
OK: pico.flag.png (585x172, 32-bit RGB+alpha, non-interlaced, static, 96.7%).
```

> **Nota:** `pngcheck` verifica la estructura interna del PNG y la
> integridad de sus chunks. No detecta esteganografía, pero confirma que
> el archivo no está corrupto ni manipulado estructuralmente.

### Identificación con `file`

``` bash
file pico.flag.png
```

El resultado confirma que se trata de un archivo PNG legítimo.

------------------------------------------------------------------------

## Fase 1: Análisis de Metadatos

Se procedió a examinar los metadatos utilizando `exiftool`.

``` bash
exiftool pico.flag.png
```

Salida relevante:

``` text
ExifTool Version Number         : 13.36
File Name                       : pico.flag.png
Directory                       : .
File Size                       : 13 kB
File Modification Date/Time     : 2023:08:04 16:36:13-04:00
File Access Date/Time           : 2026:02:24 06:43:53-05:00
File Inode Change Date/Time     : 2026:02:24 06:43:42-05:00
File Permissions                : -rw-rw-r--
File Type                       : PNG
File Type Extension             : png
MIME Type                       : image/png
Image Width                     : 585
Image Height                    : 172
Bit Depth                       : 8
Color Type                      : RGB with Alpha
Compression                     : Deflate/Inflate
Filter                          : Adaptive
Interlace                       : Noninterlaced
Image Size                      : 585x172
Megapixels                      : 0.101
```

No se observan campos personalizados, comentarios incrustados ni
metadatos anómalos.

------------------------------------------------------------------------

## Fase 2: Búsqueda de Datos Embebidos con Binwalk

Se intentó identificar posibles archivos incrustados o firmas
adicionales dentro del PNG.

``` bash
binwalk pico.flag.png
```

Resultado:

No se detectan firmas adicionales ni archivos embebidos.

------------------------------------------------------------------------

## Fase 3: Análisis de Esteganografía con zsteg

Dado que no se encontraron anomalías estructurales ni metadatos
sospechosos, se planteó la hipótesis de esteganografía en el nivel de
píxel.

``` bash
zsteg -a pico.flag.png > zsteg_logs.txt
```

Posteriormente se filtraron resultados relevantes:

``` bash
cat zsteg_logs.txt | grep -i pico
```

Resultado:

``` text
b1,rgb,lsb,xy       .. text: "picoCTF{7h3r3_15_n0_5p00n_96ae0ac1}$t3g0"
```

------------------------------------------------------------------------

## Interpretación Técnica

El resultado indica:

-   `b1` → uso de 1 bit
-   `rgb` → canales RGB
-   `lsb` → Least Significant Bit
-   `xy` → orden espacial estándar

Esto confirma que la información fue ocultada utilizando
**esteganografía LSB**, modificando el bit menos significativo de los
canales de color.

------------------------------------------------------------------------

## Flag Recuperada

La flag válida es:

    picoCTF{7h3r3_15_n0_5p00n_96ae0ac1}

------------------------------------------------------------------------

## Flujo de Análisis Detectado

1.  Capa 1: Archivo PNG válido
2.  Capa 2: Sin metadatos ocultos
3.  Capa 3: Sin archivos embebidos
4.  Capa 4: Esteganografía LSB en canales RGB
5.  Capa 5: Texto plano (Flag)

------------------------------------------------------------------------

## Conclusión

Este reto demuestra que la ausencia de anomalías visibles no implica
ausencia de datos ocultos.

Un enfoque forense estructurado requiere:

-   Validar la integridad del archivo.
-   Inspeccionar metadatos.
-   Analizar contenido binario.
-   Considerar técnicas de esteganografía.

## Referencias

- [PicoCTF](https://picoctf.org)

- [Reto St3g0](https://play.picoctf.org/practice/challenge/305) 