def Uniqueness_Check(result):
    if len(result) != 1:
        # Error, expected 1 result, got len(result) results
        raise ValueError(f"Expected 1 result, got {len(result)} results")