#!/usr/bin/env node

import axios from "axios";
import bytes from "bytes";
import dedent from "dedent";

const query = new URLSearchParams({
  author: "mozilla",
  page_size: 100,
  type: "extension",
});
const uri = `https://addons.mozilla.org/api/v5/addons/search/?${query}`;
const dateFormatter = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });

const res = await axios.get(uri);

console.log(uri + "\n\n");

res.data.results?.sort((a, b) => {
    const aDate = new Date(a.last_updated);
    const bDate = new Date(b.last_updated);
    return bDate - aDate;
  })
  .forEach((ext) => {
    const dat = new Date(ext.last_updated);
    console.log(dedent`
      name: ${ext.name["en-US"]} (${ext.current_version.version})
      size: ${bytes(ext.current_version.file.size, { decimalPlaces: 1, unitSeparator: " "})}
      last_updated: ${ dateFormatter.format(dat)} (${msAgo(dat).toLocaleString()} days ago)
      ratings: ${ext.ratings.average} (${ext.ratings.count?.toLocaleString()})
      average_daily_users: ${ext.average_daily_users.toLocaleString()}
      weekly_downloads: ${ext.weekly_downloads.toLocaleString()}
      homepage: ${ext.homepage?.url?.["en-US"] || "n/a"}
      license: ${ext.current_version.license?.slug}
    `);
    console.log("");
  });

function msAgo(date) {
  const daysInMs = 1000 * 60 * 60 * 24;
  const now = Date.now();
  const dateMs = new Date(date).getTime();
  return Math.ceil((now - dateMs) / daysInMs);
}
