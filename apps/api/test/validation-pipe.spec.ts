import "reflect-metadata";

import { IsString } from "class-validator";
import { describe, expect, it } from "vitest";

import { createStrictValidationPipe } from "../src/platform/http/application-bootstrap.js";

class TestRequestDto {
  @IsString()
  public name!: string;
}

describe("strict ValidationPipe", () => {
  it("transforms valid input into the declared DTO", async () => {
    const pipe = createStrictValidationPipe();

    const result = await pipe.transform(
      { name: "Synthetic resident" },
      { data: "", metatype: TestRequestDto, type: "body" },
    );

    expect(result).toBeInstanceOf(TestRequestDto);
    expect(result).toEqual({ name: "Synthetic resident" });
  });

  it("rejects fields outside the DTO allowlist", async () => {
    const pipe = createStrictValidationPipe();

    await expect(
      pipe.transform(
        { name: "Synthetic resident", tenantId: "client-controlled" },
        { data: "", metatype: TestRequestDto, type: "body" },
      ),
    ).rejects.toMatchObject({ status: 400 });
  });
});
