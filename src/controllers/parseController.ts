import { Request, Response } from "express";
import * as cheerio from "cheerio";
import { formatAttribute } from "../utils/attributeHelper.js";
import _ from "lodash";

const combinators = [" ", ">", "+", "~", ","];

const attrComparisons = ["=", "~=", "|=", "*=", "^=", "$=", "i", "s"];

interface ResponseObject {
  selector: string;
  preview: string[];
  types: string[];
  combinators: string[];
  ids: string[];
  classes: string[];
  attributeNames: string[];
  attributeValues?: unknown[];
  attrComparisons?: string[];
}

const pseudoClasses = [
  ":not",
  ":has",
  ":root",
  ":empty",
  ":first-child",
  ":last-child",
  ":first-of-type",
  ":last-of-type",
  ":only-of-type",
  ":only-child",
  ":nth-child",
  ":nth-last-child",
  ":nth-of-type",
  ":nth-last-of-type",
  ":any-link",
  ":link",
  ":visited",
  ":hover",
  ":active",
  ":checked",
  ":disabled",
  ":enabled",
  ":required",
  ":optional",
];

export async function parse(req: Request, res: Response) {
  try {
    const html = req.body.html;
    const selector = req.body.selector || "body";
    const previewType = req.body.previewType || "html";

    const $ = cheerio.load(html);

    const parentElements = $(selector);
    const childElements = parentElements.children();

    const types = _.uniq(childElements.map((_, el) => el.name).get());
    const ids = _.uniq(
      childElements
        .filter((_, el) => !!(el.attribs && el.attribs.id))
        .map((_, el) => formatAttribute("id", el.attribs.id))
        .get()
    );
    const classes = _.uniq(
      _.flatMap(
        childElements.filter((_, el) => !!(el.attribs && el.attribs.class)),
        (el) =>
          _.map(el.attribs.class.split(" "), (value) =>
            formatAttribute("class", value)
          )
      )
    );

    const extractAttributes = (elements: cheerio.Cheerio<any>) =>
      _.flatMap(elements, (element) =>
        _.filter(
          _.entries(element.attribs),
          ([key, _]) => !["class", "id"].includes(key)
        )
      );

    const parentElementsAttributes = extractAttributes(parentElements);
    const childElementAttributes = extractAttributes(childElements);

    const attributeNames = _.uniq(
      _.map(childElementAttributes, ([key, _]) => formatAttribute("attr", key))
    );

    const attributeValues = _.uniq(
      _.map(parentElementsAttributes, ([_, value]) => value)
    );

    const getPreviewType = () => {
      switch (previewType) {
        case "text":
          return "innerHTML";
        default:
          return "outerHTML";
      }
    };

    const preview = parentElements
      .map((i, el) => $(el).prop(getPreviewType()))
      .get();

    const response: ResponseObject = {
      selector,
      preview,
      types,
      ids,
      classes,
      combinators,
      attributeNames,
    };

    if (/\[[^\]]+\]$/.test(selector) && preview.length) {
      response.attrComparisons = attrComparisons;
      response.attributeValues = attributeValues;
    }

    res.json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
