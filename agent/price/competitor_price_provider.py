import os
import json
import re
from abc import ABC, abstractmethod
from dotenv import load_dotenv
from tavily import TavilyClient
from openai import OpenAI
from firecrawl import FirecrawlApp

load_dotenv()

# ============================================================
# BASE PROVIDER
# ============================================================
class CompetitorPriceProvider(ABC):

    @abstractmethod
    def get_prices(
        self,
        product_id: str,
        product_name: str
    ) -> dict:
        pass


# ============================================================
# REAL COMPETITOR PRICE PROVIDER
# ============================================================
class TavilyFirecrawlCompetitorPriceProvider(
    CompetitorPriceProvider
):

    MAX_RELEVANT_CHARS = 5000
    MAX_RELEVANT_LINES = 40

    STOP_WORDS = {
        "the",
        "and",
        "for",
        "with",
        "from",
        "online",
        "india",
        "amazon",
        "flipkart"
    }

    # Common ecommerce colors.
    # Used only for detecting explicit URL mismatches.
    COLORS = {
        "black","white","silver","gold","blue","deep blue","light blue","sky blue","navy blue","red","green",
        "pink","purple","lavender","orange","cosmic orange","burgundy","glacier","gray","grey","titanium","natural titanium",
        "desert titanium", "space black","midnight","starlight"
    }

    def __init__(self):

        self.tavily = TavilyClient(
            api_key=os.getenv("TAVILY_API_KEY")
        )

        self.llm_client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=os.getenv("OPENROUTER_API_KEY")
        )

        self.firecrawl = FirecrawlApp(
            api_key=os.getenv("FIRECRAWL_API_KEY")
        )


    # ========================================================
    # SEARCH PRODUCT
    # ========================================================

    def search_product(
        self,
        product_name: str,
        marketplace: str
    ):

        if marketplace == "amazon":
            query = (
                f"Apple {product_name} Amazon India"
            )
            domain = "amazon.in"

        else:
            query = (
                f"Apple {product_name} Flipkart India"
            )
            domain = "flipkart.com"

        try:
            response = self.tavily.search(
                query=query,
                search_depth="advanced",
                max_results=3,
                include_domains=[domain]
            )
            return response.get(
                "results",
                []
            )
        except Exception as e:
            print(
                f"[{marketplace}] Tavily search failed: {e}"
            )
            return []


    # ========================================================
    # PICK FIRST URL
    # ========================================================

    def get_first_url(
        self,
        results
    ):
        if not results:
            return None
        return results[0].get("url")


    # ========================================================
    # FIRECRAWL
    # ========================================================

    def scrape_page(
        self,
        url: str,
        marketplace: str
    ):
        if not url:
            return ""
        try:

            result = self.firecrawl.scrape_url(
                url,
                formats=["markdown"]
            )

            if isinstance(result, dict):

                content = result.get(
                    "markdown",
                    ""
                )
            else:

                content = getattr(
                    result,
                    "markdown",
                    ""
                )

            return content or ""

        except Exception as e:

            print(
                f"[{marketplace}] Firecrawl failed: {e}"
            )

            return ""


    # ========================================================
    # NORMALIZE TEXT
    # ========================================================

    def normalize_text(
        self,
        text: str
    ):

        text = text.lower()

        text = text.replace(
            "\u00a0",
            " "
        )

        text = re.sub(
            r"\s+",
            " ",
            text
        )

        return text.strip()


    # ========================================================
    # SEARCH TERMS
    # ========================================================

    def build_search_terms(
        self,
        product_name: str
    ):

        normalized = self.normalize_text(
            product_name
        )

        tokens = re.findall(
            r"[a-z0-9]+",
            normalized
        )

        terms = []

        for token in tokens:

            if token in self.STOP_WORDS:
                continue

            if len(token) <= 1:
                continue

            terms.append(token)

        storage_match = re.search(
            r"(\d+(?:\.\d+)?)\s*(tb|gb)",
            normalized
        )

        if storage_match:

            number = storage_match.group(1)
            unit = storage_match.group(2)

            terms.append(
                f"{number}{unit}"
            )

            terms.append(
                f"{number} {unit}"
            )

        return list(
            dict.fromkeys(terms)
        )


    # ========================================================
    # LINE SCORE
    # ========================================================

    def calculate_line_score(
        self,
        line: str,
        search_terms: list[str]
    ):

        normalized_line = self.normalize_text(
            line
        )

        if not normalized_line:
            return 0

        score = 0

        for term in search_terms:

            if term in normalized_line:
                score += 3

        if "₹" in line:
            score += 8

        if "rs." in normalized_line:
            score += 6

        if "price" in normalized_line:
            score += 5

        if "selling price" in normalized_line:
            score += 8

        variant_keywords = [
            "storage",
            "colour",
            "color",
            "variant",
            "gb",
            "tb"
        ]

        for keyword in variant_keywords:

            if keyword in normalized_line:
                score += 3

        purchase_keywords = [
            "buy now",
            "add to cart",
            "buy at",
            "available",
            "in stock"
        ]

        for keyword in purchase_keywords:

            if keyword in normalized_line:
                score += 2

        return score


    # ========================================================
    # EXTRACT RELEVANT CONTENT
    # ========================================================

    def extract_relevant_content(
        self,
        raw_content: str,
        product_name: str
    ):

        if not raw_content:
            return ""

        search_terms = self.build_search_terms(
            product_name
        )

        lines = raw_content.splitlines()

        scored_lines = []

        for index, line in enumerate(lines):

            score = self.calculate_line_score(
                line,
                search_terms
            )

            if score > 0:

                scored_lines.append(
                    (
                        score,
                        index,
                        line.strip()
                    )
                )

        scored_lines.sort(
            key=lambda item: item[0],
            reverse=True
        )

        selected_indexes = set()

        for (
            score,
            index,
            line
        ) in scored_lines[
            :self.MAX_RELEVANT_LINES
        ]:

            start = max(
                0,
                index - 2
            )

            end = min(
                len(lines),
                index + 3
            )

            for i in range(
                start,
                end
            ):

                selected_indexes.add(i)

        ordered_indexes = sorted(
            selected_indexes
        )

        relevant_lines = []

        for index in ordered_indexes:

            line = lines[index].strip()

            if line:
                relevant_lines.append(line)

        relevant_content = "\n".join(
            relevant_lines
        )

        if len(relevant_content) > self.MAX_RELEVANT_CHARS:

            relevant_content = (
                relevant_content[
                    :self.MAX_RELEVANT_CHARS
                ]
            )

        return relevant_content


    # ========================================================
    # EXTRACT EXPECTED PRODUCT ATTRIBUTES
    # ========================================================

    def extract_expected_attributes(
        self,
        product_name: str
    ):

        normalized = self.normalize_text(
            product_name
        )

        # ----------------------------------------------------
        # STORAGE
        # ----------------------------------------------------

        storage = None

        storage_match = re.search(
            r"(\d+(?:\.\d+)?)\s*(tb|gb)",
            normalized
        )

        if storage_match:

            storage = (
                storage_match.group(1)
                + storage_match.group(2)
            )


        # ----------------------------------------------------
        # MODEL
        # ----------------------------------------------------

        model = None

        model_match = re.search(
            r"iphone\s+\d+(?:\s+pro\s+max|\s+pro)?",
            normalized
        )

        if model_match:

            model = re.sub(
                r"\s+",
                "-",
                model_match.group(0)
            )


        # ----------------------------------------------------
        # COLOR
        # ----------------------------------------------------

        color = None

        sorted_colors = sorted(
            self.COLORS,
            key=len,
            reverse=True
        )

        for possible_color in sorted_colors:

            if possible_color in normalized:

                color = possible_color

                break


        return {
            "model": model,
            "color": color,
            "storage": storage
        }


    # ========================================================
    # NORMALIZE URL FOR MATCHING
    # ========================================================

    def normalize_url_for_matching(
        self,
        url: str
    ):

        if not url:
            return ""

        value = url.lower()

        value = value.replace(
            "%20",
            "-"
        )

        value = value.replace(
            "_",
            "-"
        )

        value = value.replace(
            " ",
            "-"
        )

        return value


    # ========================================================
    # VALIDATE MARKETPLACE URL
    # ========================================================

    def validate_marketplace_match(
        self,
        product_name: str,
        url: str
    ):

        if not url:
            return True

        expected = self.extract_expected_attributes(
            product_name
        )

        normalized_url = (
            self.normalize_url_for_matching(
                url
            )
        )


        # ----------------------------------------------------
        # STORAGE MISMATCH
        # ----------------------------------------------------

        expected_storage = expected["storage"]

        if expected_storage:

            storage_matches = re.findall(
                r"(\d+(?:\.\d+)?)-(tb|gb)",
                normalized_url
            )

            url_storages = {
                number + unit
                for number, unit
                in storage_matches
            }

            if url_storages:

                if expected_storage not in url_storages:

                    print(
                        "URL validation failed: "
                        f"storage mismatch "
                        f"(expected {expected_storage}, "
                        f"found {url_storages})"
                    )

                    return False


        # ----------------------------------------------------
        # COLOR MISMATCH
        # ----------------------------------------------------

        expected_color = expected["color"]

        if expected_color:

            detected_colors = []

            for color in self.COLORS:

                normalized_color = (
                    color.replace(
                        " ",
                        "-"
                    )
                )

                if normalized_color in normalized_url:

                    detected_colors.append(
                        color
                    )

            if detected_colors:

                if expected_color not in detected_colors:

                    print(
                        "URL validation failed: "
                        f"color mismatch "
                        f"(expected {expected_color}, "
                        f"found {detected_colors})"
                    )

                    return False


        # ----------------------------------------------------
        # MODEL MISMATCH
        # ----------------------------------------------------

        expected_model = expected["model"]

        if expected_model:

            expected_is_pro_max = (
                "pro-max" in expected_model
            )

            expected_is_pro = (
                "-pro" in expected_model
                and not expected_is_pro_max
            )

            url_has_pro_max = (
                "pro-max" in normalized_url
                or "pro_max" in normalized_url
            )

            url_has_pro = (
                "-pro-" in normalized_url
                or "-pro/" in normalized_url
                or "-pro." in normalized_url
            )

            if expected_is_pro_max:

                # Expected Pro Max but URL explicitly
                # contains only Pro.
                if (
                    url_has_pro
                    and not url_has_pro_max
                ):

                    print(
                        "URL validation failed: "
                        "model mismatch "
                        "(expected Pro Max, "
                        "found Pro)"
                    )

                    return False

            elif expected_is_pro:

                # Expected Pro but URL explicitly
                # says Pro Max.
                if url_has_pro_max:

                    print(
                        "URL validation failed: "
                        "model mismatch "
                        "(expected Pro, "
                        "found Pro Max)"
                    )

                    return False


        return True


    # ========================================================
    # EXTRACT PRICES USING LLM
    # ========================================================

    def extract_prices(
        self,
        product_name: str,
        amazon_url: str | None,
        amazon_content: str,
        flipkart_url: str | None,
        flipkart_content: str
    ):

        prompt = f"""
You are an ecommerce price extraction system.

Requested product:
{product_name}


================ AMAZON ================

Amazon URL:
{amazon_url}

Relevant Amazon content:
{amazon_content}


================ FLIPKART ================

Flipkart URL:
{flipkart_url}

Relevant Flipkart content:
{flipkart_content}


============================================================
MATCHING RULES
============================================================

The requested product must match EXACTLY on:

1. Product model
2. Color
3. Storage capacity

If ANY of these do not match,
return null for that marketplace.


============================================================
PRICE RULES
============================================================

- Return the current normal selling price.
- Ignore MRP.
- Ignore crossed-out prices.
- Ignore cashback.
- Ignore exchange/trade-in prices.
- Ignore EMI prices.
- Ignore coupon-only prices.
- Ignore prices from other variants.
- Do not calculate a price.
- Do not guess.
- If exact product matching is uncertain,
  return null.
- If reliable current selling price cannot be identified,
  return null.
- If page content is empty,
  return null.


============================================================
OUTPUT
============================================================

Return ONLY structured JSON.
"""


        response_format = {
            "type": "json_schema",

            "json_schema": {

                "name": "competitor_prices",

                "schema": {

                    "type": "object",

                    "properties": {

                        "amazon_price": {
                            "type": [
                                "integer",
                                "null"
                            ]
                        },

                        "amazon_url": {
                            "type": [
                                "string",
                                "null"
                            ]
                        },

                        "flipkart_price": {
                            "type": [
                                "integer",
                                "null"
                            ]
                        },

                        "flipkart_url": {
                            "type": [
                                "string",
                                "null"
                            ]
                        }
                    },

                    "required": [
                        "amazon_price",
                        "amazon_url",
                        "flipkart_price",
                        "flipkart_url"
                    ],

                    "additionalProperties": False
                },

                "strict": True
            }
        }


        try:

            print(
                "Calling OpenRouter..."
            )

            response = self.llm_client.chat.completions.create(

                model="qwen/qwen3.8-27b:free",

                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are a precise ecommerce "
                            "price extraction system. "
                            "Never guess prices. "
                            "Return only structured JSON."
                        )
                    },

                    {
                        "role": "user",
                        "content": prompt
                    }
                ],

                response_format=response_format,

                extra_body={
                    "models": [
                        "qwen/qwen3.8-27b:free",
                        "qwen/qwen3-32b:free",
                        "nvidia/nemotron-3-super-120b-a12b:free"
                    ],

                    "provider": {
                        "allow_fallbacks": True,
                        "require_parameters": True
                    },

                    "reasoning": {
                        "enabled": False
                    }
                },

                max_tokens=1500
            )


            message = response.choices[0].message

            content = message.content

            print(
                f"LLM response received: "
                f"{bool(content)}"
            )

            if not content:

                raise ValueError(
                    "LLM returned empty content."
                )

            result = json.loads(content)

            print(
                f"LLM extracted: {result}"
            )

            return result


        except Exception as e:

            print(
                f"LLM price extraction failed: {e}"
            )

            return {
                "amazon_price": None,
                "amazon_url": amazon_url,
                "flipkart_price": None,
                "flipkart_url": flipkart_url
            }


    # ========================================================
    # GET PRICES
    # ========================================================

    def get_prices(
        self,
        product_id: str,
        product_name: str
    ) -> dict:

        print(
            f"\n========== {product_id} =========="
        )

        print(
            f"Product: {product_name}"
        )


        # ----------------------------------------------------
        # AMAZON SEARCH
        # ----------------------------------------------------

        amazon_results = self.search_product(
            product_name,
            "amazon"
        )

        amazon_url = self.get_first_url(
            amazon_results
        )


        # ----------------------------------------------------
        # FLIPKART SEARCH
        # ----------------------------------------------------

        flipkart_results = self.search_product(
            product_name,
            "flipkart"
        )

        flipkart_url = self.get_first_url(
            flipkart_results
        )


        print(
            f"Amazon URL: {amazon_url}"
        )

        print(
            f"Flipkart URL: {flipkart_url}"
        )


        # ----------------------------------------------------
        # SCRAPE
        # ----------------------------------------------------

        amazon_raw_content = self.scrape_page(
            amazon_url,
            "Amazon"
        )

        flipkart_raw_content = self.scrape_page(
            flipkart_url,
            "Flipkart"
        )


        # ----------------------------------------------------
        # REDUCE CONTENT
        # ----------------------------------------------------

        amazon_content = (
            self.extract_relevant_content(
                amazon_raw_content,
                product_name
            )
        )

        flipkart_content = (
            self.extract_relevant_content(
                flipkart_raw_content,
                product_name
            )
        )


        print(
            f"Amazon content for LLM: "
            f"{len(amazon_content)} chars"
        )

        print(
            f"Flipkart content for LLM: "
            f"{len(flipkart_content)} chars"
        )


        # ----------------------------------------------------
        # URL VALIDATION BEFORE LLM
        # ----------------------------------------------------

        amazon_match = (
            self.validate_marketplace_match(
                product_name,
                amazon_url
            )
        )

        flipkart_match = (
            self.validate_marketplace_match(
                product_name,
                flipkart_url
            )
        )


        if not amazon_match:

            print(
                "Amazon URL does not match "
                "requested product."
            )

            amazon_content = ""


        if not flipkart_match:

            print(
                "Flipkart URL does not match "
                "requested product."
            )

            flipkart_content = ""


        # ----------------------------------------------------
        # IF BOTH PLATFORMS FAILED
        # ----------------------------------------------------

        if not amazon_content and not flipkart_content:

            print(
                "No valid competitor data available."
            )

            return {
                "product_id": product_id,
                "amazon_price": None,
                "amazon_url": amazon_url,
                "flipkart_price": None,
                "flipkart_url": flipkart_url
            }


        # ----------------------------------------------------
        # LLM EXTRACTION
        # ----------------------------------------------------

        result = self.extract_prices(

            product_name=product_name,

            amazon_url=amazon_url,

            amazon_content=amazon_content,

            flipkart_url=flipkart_url,

            flipkart_content=flipkart_content
        )


        # ----------------------------------------------------
        # FORCE PRODUCT ID
        # ----------------------------------------------------

        result["product_id"] = product_id


        # ----------------------------------------------------
        # FINAL SAFETY VALIDATION
        # ----------------------------------------------------

        if not amazon_match:

            result["amazon_price"] = None


        if not flipkart_match:

            result["flipkart_price"] = None


        if not amazon_content:

            result["amazon_price"] = None


        if not flipkart_content:

            result["flipkart_price"] = None


        return result


# ============================================================
# OPTIONAL MOCK PROVIDER
# ============================================================

class MockCompetitorPriceProvider(
    CompetitorPriceProvider
):

    def get_prices(
        self,
        product_id: str,
        product_name: str
    ) -> dict:

        return {
            "product_id": product_id,
            "amazon_price": 89999,
            "amazon_url": "https://amazon.in/mock-product",
            "flipkart_price": 89999,
            "flipkart_url": "https://flipkart.com/mock-product"
        }