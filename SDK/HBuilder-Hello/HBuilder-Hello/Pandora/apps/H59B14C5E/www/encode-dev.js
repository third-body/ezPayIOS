(function (w) {
  const titles = document.getElementsByTagName("title");
  const title = titles[0];
  if (!!title) {
    const indexs = document.currentScript.getAttribute("data-index").split(",");
    function config() {
      return [
        { dp: "dc", dk: "8kA8UquyAuqW3JFLGVP7nZpT5a2daBtm" },
        { dp: "dc", dk: "8kA8UquyAuqW3JFLGVP7nZpT5a2daBtm" },
        { dp: "dc", dk: "8kA8UquyAuqW3JFLGVP7nZpT5a2daBtm" },
        { dp: "dc", dk: "8kA8UquyAuqW3JFLGVP7nZpT5a2daBtm" },
      ].filter((_, _index) => indexs.includes(String(_index)));
    }
    function buckets(list) {
      title.buckets = undefined;
      title.config = undefined;
      const r = [];
      list.forEach(({ key, png }) => {
        r.push(
          ...[
            `https://${key}.ks3-sgp.ksyun.com/${png}.png`,
            `https://storage.googleapis.com/${key}/${png}.png`,
            `https://${key}.s3.ap-east-1.amazonaws.com/${png}.png`,
          ]
        );
      });
      return r;
    }
    title.buckets = buckets;
    title.config = config;
  }
})(window);
