var val = require("../libs/unalib");
var assert = require("assert");

describe("unalib", function () {
  describe("funcion is_valid_phone", function () {
    it("deberia devolver true para 8297-8547", function () {
      assert.equal(val.is_valid_phone("8297-8547"), true);
    });

    it("deberia devolver false para 8297p-8547", function () {
      assert.equal(val.is_valid_phone("8297p-8547"), false);
    });
  });

  describe("funcion is_valid_url_image", function () {
    it("deberia devolver true para .jpg", function () {
      assert.equal(val.is_valid_url_image("http://image.com/image.jpg"), true);
    });

    it("deberia devolver true para .gif", function () {
      assert.equal(val.is_valid_url_image("http://image.com/image.gif"), true);
    });

    it("deberia devolver true para picsum.photos sin extension", function () {
      assert.equal(
        val.is_valid_url_image("https://picsum.photos/600/300"),
        true
      );
    });

    it("deberia devolver false para PDF", function () {
      assert.equal(
        val.is_valid_url_image("http://example.com/file.pdf"),
        false
      );
    });
  });

  describe("funcion is_valid_url_video_file", function () {
    it("deberia devolver true para .mp4", function () {
      assert.equal(
        val.is_valid_url_video_file("http://video.com/video.mp4"),
        true
      );
    });

    it("deberia devolver false para imagen", function () {
      assert.equal(
        val.is_valid_url_video_file("http://video.com/foto.png"),
        false
      );
    });
  });

  describe("funcion is_valid_yt_video", function () {
    it("deberia devolver true para YouTube válido", function () {
      assert.equal(
        val.is_valid_yt_video("https://www.youtube.com/watch?v=qYwlqx-JLok"),
        true
      );
    });

    it("deberia devolver false para URL que no es de YouTube", function () {
      assert.equal(
        val.is_valid_yt_video("http://example.com/video.mp4"),
        false
      );
    });
  });

  describe("funcion is_valid_vimeo_video", function () {
    it("deberia devolver true para Vimeo válido", function () {
      assert.equal(
        val.is_valid_vimeo_video("https://vimeo.com/76979871"),
        true
      );
    });
  });

  describe("funcion validateMessage", function () {
    it("deberia escapar <script> malicioso", function () {
      const raw = JSON.stringify({
        nombre: "Fran",
        mensaje: "<script>alert('x')</script>",
        color: "#111",
      });
      const result = JSON.parse(val.validateMessage(raw));
      assert.equal(result.type, "text");
      assert.ok(result.mensaje.includes("&lt;script&gt;"));
    });

    it("deberia clasificar correctamente una imagen", function () {
      const raw = JSON.stringify({
        nombre: "Fran",
        mensaje: "https://picsum.photos/200/300",
        color: "#111",
      });
      const result = JSON.parse(val.validateMessage(raw));
      assert.equal(result.type, "image");
    });

    it("deberia clasificar correctamente un video mp4", function () {
      const raw = JSON.stringify({
        nombre: "Fran",
        mensaje: "http://video.com/test.mp4",
        color: "#111",
      });
      const result = JSON.parse(val.validateMessage(raw));
      assert.equal(result.type, "video_file");
    });

    it("deberia clasificar correctamente un YouTube", function () {
      const raw = JSON.stringify({
        nombre: "Fran",
        mensaje: "https://youtu.be/dQw4w9WgXcQ",
        color: "#111",
      });
      const result = JSON.parse(val.validateMessage(raw));
      assert.equal(result.type, "youtube");
      assert.equal(result.meta.youtubeId, "dQw4w9WgXcQ");
   });
  });
});