"""Recalculate the small, explicitly constructed formula examples in the video.

These are teaching inputs and weights, not trained transformer parameters.
The 6 x 2 projection follows SpatialAttention.tsx from the production project.
"""
import argparse
import math
from common import new_output_dir, write_json


def compute_formula_examples(attention=None):
    inputs = [1.4, 2.2, 1.1, 2.9, 2.4, 1.7]
    mean = sum(inputs) / len(inputs)
    variance = sum((value - mean) ** 2 for value in inputs) / len(inputs)
    epsilon = 1e-5
    if attention is None:
        from run_mechanisms import compute_results
        attention = compute_results()["causal_attention"]
    projection_input = [.34, .72, -.17, .84, .48, -.63]
    squared_norm = sum(x * x for x in projection_input)
    projections = []
    for name in ("Q", "K", "V"):
        target = attention[name][3]
        matrix = [[value * x / squared_norm for value in target] for x in projection_input]
        products = [[projection_input[row] * value for value in values] for row, values in enumerate(matrix)]
        output = [sum(row[column] for row in products) for column in range(2)]
        projections.append({"name": name, "target": target, "weights": matrix,
                            "products": products, "output": output})
    return {
        "type": "computed teaching examples; not learned parameters",
        "norm": {"input": inputs, "mean": mean, "variance": variance, "epsilon": epsilon,
                 "normalized": [(value - mean) / math.sqrt(variance + epsilon) for value in inputs]},
        "loss": [{"p": p, "loss": -math.log(p)} for p in [.1, .8]],
        "projection": {"input": projection_input, "squaredNorm": squared_norm,
                       "rowVectorConvention": "x (1 x 6) @ W (6 x 2) = y (1 x 2)",
                       "construction": "W[r][c] = target[c] * x[r] / sum(x[r]^2)",
                       "note": "Rank-one teaching construction matching the saved Q/K/V row; not trained weights.",
                       "projections": projections},
        "sourceReferences": ["docs/v8/formula-example-evidence.json",
                             "src/visualizations/v10/SpatialAttention.tsx#SpatialQKV"],
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--out-dir", help="Empty output directory; default: repository runs/ch03-formulas-<UTC>.")
    args = parser.parse_args()
    output = new_output_dir(args.out_dir, "formulas")
    write_json(output / "formula_examples.json", compute_formula_examples())
    print(f"Formula calculations written to {output}")


if __name__ == "__main__":
    main()
