---
author: x0k
category: forensics
description: Análisis forense de un archivo PDF, identificación de información oculta y recuperación de una flag codificada en Base64 dentro del campo Author.
heroImage: /images/pdf-forensics-analysis.avif
pubDate: 2026-02-15
tags:
  - forensics
  - picoctf
  - pdf-analysis
  - metadata
  - base64
title: Análisis Forense de PDF - Writeup del Reto PicoCTF [Riddle Registry]
difficulty: easy
---

## Introducción

En este reto se nos proporcionó un archivo PDF aparentemente normal.
El objetivo era analizar el documento y determinar si contenía
información oculta.

Este tipo de ejercicios simulan escenarios reales donde archivos
aparentemente inofensivos pueden contener datos ocultos dentro de su
estructura interna o metadatos.

En entornos corporativos, los metadatos pueden filtrar información
sensible como nombres internos, versiones de software, rutas de sistema
o incluso credenciales accidentalmente expuestas.

------------------------------------------------------------------------

## Metodología de Análisis

El primer paso en un análisis forense básico consiste en validar el tipo
real del archivo y descartar manipulaciones evidentes.

### Identificación del archivo

> **Nota:** `file` es una herramienta de Unix/Linux que identifica el tipo real de un archivo mediante el análisis de sus **magic bytes** (firmas binarias internas) y no únicamente por su extensión.  
>  
> En análisis forense permite:  
> - Detectar archivos renombrados maliciosamente (ej: `.pdf` que en realidad es un ejecutable).  
> - Validar coherencia entre extensión y estructura interna.  
> - Confirmar tipo MIME real antes de procesarlo con otras herramientas.  
>  
> En contextos defensivos, es una herramienta básica para evitar ejecutar archivos con extensiones engañosas.

``` bash
file confidential.pdf
```

El resultado confirmó que se trataba de un documento PDF válido.

```bash
confidential.pdf: PDF document, version 1.7, 1 page(s)
```

Al abrir el archivo, el contenido visible no mostraba información
relevante. Algunos fragmentos estaban censurados y no parecían contener
datos útiles.

Dado que el contenido visible no revelaba nada interesante, el siguiente
paso lógico fue analizar la estructura interna del archivo.

------------------------------------------------------------------------

## Análisis de Metadatos con exiftool

Los metadatos suelen ser una fuente valiosa de información durante
investigaciones forenses.

> **Nota:**  `exiftool` es una herramienta especializada en la extracción y modificación de metadatos, compatible con múltiples formatos como PDF, imágenes, documentos Office, audio y video.  
>  
> En el caso de documentos PDF permite obtener:  
> - Autor, productor y creador del archivo  
> - Versiones de software utilizadas  
> - Timestamps de creación y modificación  
> - Campos personalizados incrustados  
>  
> Es ampliamente utilizada en:  
> - Análisis forense digital (DFIR)  
> - OSINT  
> - Respuesta a incidentes  
> - Investigación de fugas de información  
>  
> En entornos Blue Team, es clave para detectar exposición pasiva de datos sensibles.

``` bash
exiftool confidential.pdf
```

Salida relevante:

    Producer : PyPDF2
    Author   : cGljb0NURntwdXp6bDNkX20zdGFkYXRhX2YwdW5kIV9mOTQzMDBjNH0=

El campo **Author** contenía una cadena inusual:

    cGljb0NURntwdXp6bDNkX20zdGFkYXRhX2YwdW5kIV9mOTQzMDBjNH0=

### Identificación del patrón Base64

La cadena presentaba características típicas de codificación Base64:

-   Solo contenía caracteres alfanuméricos.
-   Incluía el símbolo `=` al final (indicador común de padding).
-   No era legible en texto plano.
-   Su longitud era consistente con una codificación estándar.

Estos indicadores sugieren que se trataba de información codificada y no
texto directo.

------------------------------------------------------------------------

## Decodificación

Para confirmar la hipótesis, se procedió a decodificar la cadena:

>**Nota:** `base64` es una utilidad de línea de comandos que permite codificar o decodificar datos utilizando el esquema Base64.  
>  
> Base64:  
> - Convierte datos binarios en texto ASCII.  
> - Se utiliza comúnmente en correos electrónicos, JWTs, payloads web y archivos embebidos.  
> - No es un mecanismo de cifrado, sino de codificación.  
>  
> En análisis forense es frecuente encontrar:  
> - Payloads codificados  
> - Credenciales embebidas  
> - Datos ocultos en metadatos  
> - Scripts ofuscados  
>  
> Reconocer patrones Base64 es una habilidad básica en análisis SOC y threat hunting.

``` bash
echo "cGljb0NURntwdXp6bDNkX20zdGFkYXRhX2YwdW5kIV9mOTQzMDBjNH0=" | base64 -d
```

Resultado:

    picoCTF{puzzl3d_m3tadata_f0und!_f94300c4}

La flag se encontraba oculta en los metadatos del documento y no en su
contenido visible.

------------------------------------------------------------------------

## Implicaciones para Seguridad

En un entorno real, los metadatos pueden:

-   Filtrar información interna de la organización.
-   Exponer versiones de software vulnerables.
-   Revelar nombres de usuario o sistemas internos.
-   Contener información sensible embebida accidentalmente.
-   Ocultar indicadores de compromiso (IOCs).

Desde la perspectiva defensiva, es recomendable:

-   Sanitizar metadatos antes de compartir documentos públicamente.
-   Analizar adjuntos sospechosos como parte del flujo de respuesta a
    incidentes.
-   Incluir revisión de metadatos dentro de los procedimientos de
    análisis forense básico.

------------------------------------------------------------------------

## Conclusión

Este reto demuestra la importancia de no confiar únicamente en el
contenido visible de un archivo.

Un análisis forense efectivo requiere:

-   Validar el tipo real del archivo.
-   Inspeccionar su estructura interna.
-   Analizar metadatos.
-   Identificar patrones de codificación comunes.
-   Confirmar hipótesis mediante pruebas técnicas.

En ciberseguridad defensiva, los detalles invisibles suelen ser los más
importantes.


## Referencias

- [PicoCTF](https://picoctf.org)

- [Reto Riddle Registry](https://play.picoctf.org/practice/challenge/530)