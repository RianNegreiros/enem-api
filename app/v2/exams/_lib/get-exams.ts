import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { ExamSchema, ExamSchemaV2 } from '@/lib/zod/schemas/exams';
import { slugify } from '@/lib/utils/slugify';

export async function getExamsV2() {
    const filePath = path.join(process.cwd(), 'public/exams.v2.json');
    const examsRaw = await readFile(filePath, 'utf-8');
    const exams = ExamSchema.array().parse(JSON.parse(examsRaw));

    return exams.map(exam => {
        const folder = exam.title.includes('Segunda aplicação')
            ? `${exam.year}-segunda-aplicacao`
            : `${exam.year}`;

        return ExamSchemaV2.parse({
            ...exam,
            id: slugify(exam.title),
            folder,
        });
    });
}
