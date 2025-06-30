import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { z } from 'zod';

// v2-specific schema, including the 'id'
const ExamSchemaV2 = z.object({
    id: z.string(),
    title: z.string(),
    year: z.number().int().positive(),
    disciplines: z.array(z.object({ label: z.string(), value: z.string() })),
    languages: z.array(z.object({ label: z.string(), value: z.string() })),
});

const RawExamSchema = ExamSchemaV2.omit({ id: true });

const slugify = (text: string) => {
    return text
        .toString()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
};

export async function getExamsV2() {
    const filePath = path.join(process.cwd(), 'public/exams.v2.json');
    const examsRaw = await readFile(filePath, 'utf-8');
    const exams = RawExamSchema.array().parse(JSON.parse(examsRaw));

    return exams.map(exam =>
        ExamSchemaV2.parse({
            ...exam,
            id: slugify(exam.title),
        }),
    );
}
