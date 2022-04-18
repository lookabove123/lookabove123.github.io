#!/bin/bash
# Automatically dumps our panoramic background from Google Maps. 
# Uses CURL and ImageMagick.

for x in {0..12}
do
	for y in {0..6}
	do
		curl --output "${x}_${y}.png" "https://streetviewpixels-pa.googleapis.com/v1/tile?panoid=yEkzeEuXE2Fbyb8am3m1bA&x=${x}&y=${y}&zoom=4&nbt=1&fover=1"
	done
	magick convert -append ${x}_*.png ${x}.png
done
magick convert +append {0..12}.png final.png
