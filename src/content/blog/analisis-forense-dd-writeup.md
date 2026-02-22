---
author: yusnelgg
category: forensics
description: Proceso de análisis forense sobre una imagen de disco .dd, identificación de particiones y extracción de evidencia utilizando strings y grep.
heroImage: /images/forensics-dd-analysis.jpg
pubDate: 2026-02-21
tags:
  - forensics
  - disk-analysis
  - picoctf
  - strings
  - linux
title: Análisis Forense de Imagen .dd -- Extracción de Flag
---

## Introducción

En este reto forense se nos proporcionó una imagen de disco en formato
`.dd`. El objetivo era analizar la imagen, identificar posibles fuentes
de evidencia y recuperar la flag oculta.

Este tipo de ejercicios simulan escenarios reales donde se debe analizar
un disco completo en busca de artefactos relevantes.

------------------------------------------------------------------------

## Identificación de la Imagen

El primer paso fue identificar el tipo de archivo:

``` bash
file disko-2.dd
```

Lo que me devolvió:

``` bash
disko-2.dd: DOS/MBR boot sector; partition 1 : ID=0x83, start-CHS (0x0,32,33), end-CHS (0x3,80,13), startsector 2048, 51200 sectors; partition 2 : ID=0xb, start-CHS (0x3,80,14), end-CHS (0x7,100,29), startsector 53248, 65536 sectors
```

Luego inspeccioné la estructura de particiones:

``` bash
fdisk -l disko-2.dd
```

El análisis reveló que la imagen contenía **dos particiones**.

------------------------------------------------------------------------

## Análisis Técnico del MBR

La imagen contenía un MBR (Master Boot Record), lo que indica que se trata de un esquema de particionado tradicional y no GPT.

Las particiones identificadas fueron:

``` text
- ID 0x83 → Linux filesystem
- ID 0x0b → FAT32
```

Esto permitió determinar el tipo de sistema de archivos antes del análisis.

------------------------------------------------------------------------

## Aislamiento de Particiones

> **Nota:** Los valores de `skip` y `count` se calcularon en base a la información obtenida del sector de inicio y el número total de sectores. Dado que cada sector equivale a 512 bytes:

``` bash
- Partición 1:
  - startsector: 2048
  - sectores: 51200

- Partición 2:
  - startsector: 53248
  - sectores: 65536
```

Para analizar cada partición de forma independiente, extraje cada una
usando `dd`.

``` bash
dd if=disko-2.dd of=linux_part.dd bs=512 skip=2048 count=51200 status=progress
dd if=disko-2.dd of=fat_part.dd bs=512 skip=53248 count=65536 status=progress
```

Esto permitió trabajar sobre cada partición como imágenes separadas.

------------------------------------------------------------------------

## Análisis de Cadenas

Dado que muchos retos CTF esconden flags en texto plano o artefactos
simples, utilicé `strings` para extraer cadenas legibles:

``` bash
strings linux_part.dd | less
```

Luego filtré directamente buscando el patrón típico de picoCTF:

``` bash
strings linux_part.dd | grep -i "picoCTF"
```

Tras analizar ambas particiones, la flag fue localizada dentro de la partición Linux (ID 0x83), lo que sugiere que el artefacto se encontraba dentro del sistema de archivos de la partición Linux.

------------------------------------------------------------------------

## Hallazgo de la Flag

``` text
picoCTF{4_P4Rt_1t_i5_055dd175}
```

La flag estaba almacenada en texto plano dentro de la partición, lo que
indica que no había cifrado ni ofuscación avanzada en este reto.

> **Nota Técnica:** En un escenario real de análisis forense, antes de manipular la imagen se debería calcular un hash (MD5 o SHA256) para garantizar la integridad de la evidencia.

------------------------------------------------------------------------

## Puntos a tener en cuenta

-   Siempre identificar la estructura de particiones antes de analizar
    una imagen.
-   Aislar evidencia facilita el análisis.
-   `strings` sigue siendo una herramienta poderosa en análisis inicial.
-   Buscar patrones específicos acelera la investigación.

------------------------------------------------------------------------

## Referencias

- [PicoCTF](https://picoctf.org)
