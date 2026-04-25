export interface RoastResult {
  roast: string;
  score: {
    overall: number;
    breakdown: {
      clarity: number;
      impact: number;
      formatting: number;
      keywords: number;
      ats: number;
    };
  };
  improvements: Array<{
    number: number;
    title: string;
    before: string;
    after: string;
  }>;
  vibe: string;
}
