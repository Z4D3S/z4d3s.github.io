---
author: x0k
category: forensics
event: PicoCTF
description: Análisis forense de imagen PNG que contenía un archivo ZIP
  embebido. Mediante binwalk se identificó y extrajo un directorio
  oculto que reveló la flag.
difficulty: medium
heroImage: /images/pico-hideme.avif
pubDate: 2026-02-24
tags:
- forensics
- picoctf
- png
- binwalk
- zip
- file-carving
title: Análisis Forense PNG con binwalk - Writeup del Reto PicoCTF [HideMe]
---

## Introducción

En este reto se proporciona una imagen PNG aparentemente legítima.

El objetivo consiste en determinar si el archivo contiene información
oculta y recuperar la flag.

A diferencia de técnicas de esteganografía LSB, este reto utiliza
ocultación mediante **archivo ZIP embebido dentro del PNG**.

------------------------------------------------------------------------

## Metodología de Análisis

Se aplicó un enfoque estructurado:

1.  Validación del tipo de archivo.
2.  Análisis binario completo.
3.  Identificación de firmas adicionales.
4.  Extracción del contenido embebido.

------------------------------------------------------------------------

## Fase 0: Identificación Inicial

``` bash
file flag.png
```

Resultado:

``` text
flag.png: PNG image data, 512 x 504, 8-bit/color RGBA, non-interlaced
```

El archivo es reconocido como una imagen PNG válida.

------------------------------------------------------------------------

## Fase 1: Análisis con Binwalk

Se ejecutó:

``` bash
binwalk flag.png
```

Resultado:

``` text
DECIMAL       HEXADECIMAL     DESCRIPTION
--------------------------------------------------------------------------------
0             0x0             PNG image, 512 x 504, 8-bit/color RGBA, non-interlaced
41            0x29            Zlib compressed data, compressed
39739         0x9B3B          Zip archive data, at least v1.0 to extract, name: secret/
39804         0x9B7C          Zip archive data, at least v2.0 to extract, compressed size: 2997, uncompressed size: 3152, name: secret/flag.png
43036         0xA81C          End of Zip archive, footer length: 22
```

El análisis revela claramente la presencia de un **archivo ZIP
incrustado dentro del PNG**.

------------------------------------------------------------------------

## Fase 2: Extracción Automática

``` bash
binwalk -e flag.png
```

Resultado:

``` text
DECIMAL       HEXADECIMAL     DESCRIPTION
--------------------------------------------------------------------------------
41            0x29            Zlib compressed data, compressed
39739         0x9B3B          Zip archive data, at least v1.0 to extract, name: secret/
39804         0x9B7C          Zip archive data, at least v2.0 to extract, compressed size: 2997, uncompressed size: 3152, name: secret/flag.png

WARNING: One or more files failed to extract: either no utility was found or it's unimplemented
```

Aunque aparece una advertencia, el directorio `secret/` fue
correctamente extraído.

------------------------------------------------------------------------

## Fase 3: Análisis del Contenido Extraído

Dentro del directorio recuperado se encontró:

    secret/
    └── flag.png

Verificación del archivo extraído:

``` bash
file secret/flag.png
```

El archivo corresponde nuevamente a una imagen PNG válida.

Al abrirla, se observa directamente la flag.

```bash
xdg-open flag.png
```

```lua
picoCTF{Hiddinng_An_imag3_within_@n_Ima9e_85e04ab8}
```

------------------------------------------------------------------------

## Flujo de Capas Detectado

1.  Capa 1: PNG legítimo (contenedor principal)
2.  Capa 2: Datos adicionales después del chunk IEND
3.  Capa 3: Archivo ZIP embebido
4.  Capa 4: Directorio `secret`
5.  Capa 5: Imagen `flag.png`
6.  Capa 6: Flag visible

------------------------------------------------------------------------

## Interpretación Técnica

El PNG contiene datos adicionales concatenados después del final lógico
del archivo (`IEND`).

El estándar PNG permite que visores ignoren datos posteriores, lo que
posibilita ocultar archivos completos sin afectar la visualización.

`binwalk` detecta estas firmas porque analiza el binario completo en
busca de encabezados conocidos (en este caso, estructura ZIP).

------------------------------------------------------------------------

## Conclusión

Este reto demuestra una técnica clásica de ocultación mediante
contenedores.

No hay manipulación de píxeles ni esteganografía LSB.
La imagen funciona como **portador de un archivo ZIP embebido**.

En análisis forense real, es fundamental:

-   Examinar el binario completo.
-   Detectar datos posteriores al final lógico del archivo.
-   Utilizar herramientas de carving.

El análisis por capas permitió identificar correctamente la estructura y
recuperar la flag.

---

## Referencias

- [PicoCTF](https://picoctf.org)

- [Reto hideme](https://play.picoctf.org/practice/challenge/350)