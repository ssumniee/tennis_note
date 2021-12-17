const { club, student, teacher, day, student_day, club_day } = require("../../models");

module.exports = {
  findOneClub: async (queries, excludes = []) => {
    return await club.findOne({
      where: { ...queries },
      attributes: { exclude: [...excludes] },
    });
  },
  findAllClubInfo: async () => {
    const adminsData = await club.findAll({
      where: { is_admin: true },
      order: ["createdAt"],
    });
    const tempsData = await club.findAll({
      where: { temp: true },
      order: ["createdAt"],
    });
    const clubsData = await club.findAll({
      where: { is_admin: false, temp: false },
      attributes: { exclude: ["password"] },
      order: ["createdAt"],
    });
    return {
      admins: adminsData.map((admin) => admin.dataValues),
      temps: tempsData.map((temp) => temp.dataValues),
      clubs: clubsData.map((club) => club.dataValues),
    };
  },
  updateClubInfo: async (updated) => {
    // 변경된 클럽 정보
    const { id: club_id, name, tel, dayoffs } = updated;
    // 클럽 정보 갱신
    await club.update(
      { name, tel },
      {
        where: {
          id: club_id,
        },
      }
    );
    // 기존 휴무일 id값들
    const prevDayoffsData = await club_day.findAll({
      where: { club_id },
      attributes: ["dayoff_id"],
      order: ["dayoff_id"],
    });
    const prevDayoffs = prevDayoffsData.map((data) => data.dayoff_id);
    // updated에 따른 휴무일 id값들 받아오기
    const updatedDayoffs = [...dayoffs];
    // 새로 추가된 휴무일 id값들
    const toCreate = updatedDayoffs.filter((id) => !prevDayoffs.includes(id));
    // 수업이 없어진 요일 id값들
    const toDestroy = prevDayoffs.filter((id) => !updatedDayoffs.includes(id));
    // 새로 추가된 휴무일 정보 club_day 테이블에 생성
    await Promise.all(
      toCreate.map(async (id) => await club_day.create({ club_id, dayoff_id: id }))
    );
    // 없어진 휴무일 정보 club_day 테이블에서 삭제
    await Promise.all(
      toDestroy.map(async (id) => await club_day.destroy({ where: { dayoff_id: id } }))
    );
    return { ...updated };
  },
  createClubInfo: async (club_info) => {
    // 클럽 정보 생성
    const created = await club.create({ ...club_info });
    return { ...created.dataValues };
  },
  destroyClubInfo: async (club_id) => {
    // 클럽 정보 삭제
    await club.destroy({ where: { id: club_id } });
    return { club_id };
  },
  findAllStudentInfo: async (club_id) => {
    // club_id로 필요한 학생 정보 가져오기
    const raw = await student.findAll({
      where: { club_id },
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
    });
    // 학생 정보 가공: 요일 정보 합치기
    const refined = await Promise.all(
      raw.map(async (student) => {
        // student_id로 수업이 있는 요일 정보 받아오기
        const targetDays = await student_day.findAll({
          where: { student_id: student.id },
          attributes: ["day_id"],
          order: ["day_id"],
        });
        const days = targetDays.map((el) => el.day_id);
        return { ...student.dataValues, days };
      })
    );
    return refined;
  },
  updateStudentInfo: async (updated) => {
    // 변경된 학생 정보
    const { id: student_id, name, tel, start_date, teacher_id, days, count } = updated;
    // 학생 정보 갱신
    await student.update(
      { name, tel, start_date, teacher_id, count },
      {
        where: {
          id: student_id,
        },
      }
    );
    // 기존 수업 요일 id값들
    const prevDaysData = await student_day.findAll({
      where: { student_id },
      attributes: ["day_id"],
      order: ["day_id"],
    });
    const prevDays = prevDaysData.map((data) => data.day_id);
    // updated에 따른 수업 요일 id값들 받아오기
    const updatedDays = [...days];
    // 새로 추가된 수업 요일 id값들
    const toCreate = updatedDays.filter((id) => !prevDays.includes(id));
    // 수업이 없어진 요일 id값들
    const toDestroy = prevDays.filter((id) => !updatedDays.includes(id));
    // 새로 추가된 수업 요일 정보 student_day 테이블에 생성
    await Promise.all(
      toCreate.map(async (id) => await student_day.create({ student_id, day_id: id }))
    );
    // 수업이 없어진 요일 정보 student_day 테이블에서 삭제
    await Promise.all(
      toDestroy.map(async (id) => await student_day.destroy({ where: { day_id: id } }))
    );
    return { ...updated };
  },
  createStudentInfo: async ({ student: student_info, days }) => {
    // 학생 정보 생성
    const created = await student.create({ ...student_info });
    const { id: student_id } = created.dataValues;
    // 수업 요일 id값들에 따라 수업 요일 정보 student_day 테이블에 생성
    await Promise.all(days.map(async (id) => await student_day.create({ student_id, day_id: id })));
    return { id: student_id, ...student, days };
  },
  destroyStudentInfo: async (student_id) => {
    // 학생 정보 삭제
    await student.destroy({ where: { id: student_id } });
    return { student_id };
  },
  minusStudentCounts: async (day_id) => {
    // 요일 아이디로 해당 요일에 수업이 있는 학생들 정보 구하기
    const studentsData = await student_day.findAll({
      where: { day_id },
      attributes: [],
      include: [{ model: student, attributes: ["id", "count", "start_date"] }],
      raw: true,
    });
    // 수업 시작 날짜가 오늘 날짜보다 빠른 학생 정보만 필터링하기
    const today = new Date();
    const toUpdateData = studentsData.filter(
      (data) => new Date(data["student.start_date"]) < today
    );
    // 필터링된 학생 정보에서 수업 횟수를 1 차감하여 업데이트하기 (0인 경우는 그대로 두기)
    const updated = toUpdateData.map((data) => ({
      id: data["student.id"],
      count: data["student.count"] >= 1 ? data["student.count"] - 1 : 0,
    }));
    // updated 정보로 학생 정보 갱신
    await Promise.all(
      updated.map(async ({ id, count }) => {
        const targetStudent = await student.findOne({ where: { id } });
        await targetStudent.update({ count });
      })
    );
    return updated;
  },
  findAllTeacherInfo: async (club_id) => {
    const teachersData = await teacher.findAll({
      where: { club_id },
      attributes: ["id", "name"],
    });
    return teachersData.map((data) => data.dataValues);
  },
  findAllDayInfo: async (club_id) => {
    const allDaysData = await day.findAll({
      attributes: ["id", "name"],
    });
    const offDaysData = await club_day.findAll({
      where: { club_id },
      attributes: ["dayoff_id"],
    });
    const allDays = allDaysData.map((data) => data.dataValues);
    const dayoffIds = offDaysData.map((data) => data.dataValues.dayoff_id);
    return allDays.map((day) => {
      if (dayoffIds.includes(day.id)) return { ...day, off: true };
      else return { ...day, off: false };
    });
  },
};
