{ pkgs }: {
	deps = [
		pkgs.nodejs-18_x
		pkgs.libuuid
		pkgs.cairo
		pkgs.pango
		pkgs.libjpeg
		pkgs.giflib
		pkgs.librsvg
	];
}