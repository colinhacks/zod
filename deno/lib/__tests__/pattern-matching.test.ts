// @ts-ignore TS6133
import { expect } from "https://deno.land/x/expect@v0.2.6/mod.ts";
const test = Deno.test;

import * as z from "../index.ts";

it('pattern matches', () => {
  const teacherOrStudent = z
    .object({ name: z.string(), role: z.literal('teacher') })
    .or(z.object({ name: z.string(), role: z.literal('student') }))

  const isTeacherOrStudent = teacherOrStudent.match(
    teacher => teacher.role === 'teacher',
    student => student.role === 'student'
  )
  expect(isTeacherOrStudent({ name: 'abcd', role: 'teacher' })).toStrictEqual({ key: 0, value: true })
  expect(isTeacherOrStudent({ name: 'efgh', role: 'student' })).toStrictEqual({ key: 1, value: true })

  const teacherOrStudentOrProgrammer = teacherOrStudent.or(z.object({ name: z.string(), role: z.literal('programmer') }))
  const worksInClassrooms = teacherOrStudentOrProgrammer.match(
    {key: 'teacherOrStudent', check: () => true}, // teacher or student (the first union does not get unwrapped)
    {key: 'programmer', check: () => false}, // programmer
  )
  expect(worksInClassrooms({ name: 'abcd', role: 'teacher' })).toStrictEqual({ key: 'teacherOrStudent', value: true })
  expect(worksInClassrooms({ name: 'efgh', role: 'student' })).toStrictEqual({ key: 'teacherOrStudent', value: true })
  expect(worksInClassrooms({ name: 'ijkl', role: 'programmer' })).toStrictEqual({ key: 'programmer', value: false })
})
