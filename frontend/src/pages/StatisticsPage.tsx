import { CheckCircleOutlined, CloseCircleOutlined, HomeOutlined, TeamOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Card, Col, Row, Spin, Statistic, Typography } from "antd";
import { api } from "../lib/axios";
import type { IStatistics } from "../lib/types";

const { Title } = Typography;

const StatisticsPage = () => {
  const { data: statistics, isLoading } = useQuery<IStatistics>({
    queryKey: ["statistics"],
    queryFn: async () => {
      const data = await api.get("/statistics");
      return data as unknown as IStatistics;
    },
  });

  if (isLoading) {
    return (
      <main className="p-6 flex-1 flex items-center justify-center">
        <Spin size="large" />
      </main>
    );
  }

  const statsCards = [
    {
      title: "Jami talabalar",
      value: statistics?.studentsCount || 0,
      icon: <TeamOutlined className="text-4xl" />,
      gradient: "from-blue-500 to-blue-600",
      bgLight: "bg-blue-50",
      textColor: "text-blue-600",
      iconBg: "bg-blue-100",
    },
    {
      title: "Yotoqxonalar soni",
      value: statistics?.dormitoriesCount || 0,
      icon: <HomeOutlined className="text-4xl" />,
      gradient: "from-purple-500 to-purple-600",
      bgLight: "bg-purple-50",
      textColor: "text-purple-600",
      iconBg: "bg-purple-100",
    },
    {
      title: "Bugun kelganlar",
      value: statistics?.presentToday || 0,
      icon: <CheckCircleOutlined className="text-4xl" />,
      gradient: "from-green-500 to-green-600",
      bgLight: "bg-green-50",
      textColor: "text-green-600",
      iconBg: "bg-green-100",
    },
    {
      title: "Bugun kelmaganlar",
      value: statistics?.absentToday || 0,
      icon: <CloseCircleOutlined className="text-4xl" />,
      gradient: "from-red-500 to-red-600",
      bgLight: "bg-red-50",
      textColor: "text-red-600",
      iconBg: "bg-red-100",
    },
  ];

  return (
    <main className="p-4 md:p-6 flex-1 min-h-screen bg-linear-to-br from-slate-50 to-slate-100">
      <div className="mb-8">
        <Title level={2} className="mb-1! text-slate-800!">
          Statistika
        </Title>
        <p className="text-slate-500">Umumiy ko'rsatkichlar va bugungi holat</p>
      </div>

      <Row gutter={[24, 24]}>
        {statsCards.map((stat, index) => {
          // Hide attendance cards (index 2 and 3) if no attendance data today
          if (!statistics?.hasAttendanceToday && (index === 2 || index === 3)) {
            return null;
          }

          return (
            <Col xs={24} sm={12} lg={6} key={index}>
              <Card
                className={`
                relative overflow-hidden border-0 shadow-lg hover:shadow-xl 
                transition-all duration-300 transform hover:-translate-y-1
                ${stat.bgLight}
              `}
                styles={{
                  body: { padding: "24px" },
                }}
              >
                {/* Background decoration */}
                <div
                  className={`
                  absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-20
                  bg-linear-to-br ${stat.gradient}
                `}
                />
                <div
                  className={`
                  absolute -bottom-4 -left-4 w-16 h-16 rounded-full opacity-10
                  bg-linear-to-br ${stat.gradient}
                `}
                />

                <div className="flex items-start justify-between relative z-10">
                  <div className="flex-1">
                    <p className="text-slate-500 text-sm font-medium mb-2 uppercase tracking-wide">{stat.title}</p>
                    <Statistic
                      value={stat.value}
                      styles={{
                        content: {
                          fontSize: "2.5rem",
                          fontWeight: 700,
                          lineHeight: 1.2,
                        },
                      }}
                      className={stat.textColor}
                    />
                  </div>
                  <div
                    className={`
                    ${stat.iconBg} p-4 rounded-2xl ${stat.textColor}
                    shadow-sm
                  `}
                  >
                    {stat.icon}
                  </div>
                </div>

                {/* Progress indicator */}
                <div className="mt-4 pt-4 border-t border-slate-200/50">
                  <div className="flex items-center gap-2">
                    <div
                      className={`
                      w-2 h-2 rounded-full bg-linear-to-r ${stat.gradient}
                      animate-pulse
                    `}
                    />
                    <span className="text-xs text-slate-400">Jonli ma'lumotlar</span>
                  </div>
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* Show message when no attendance data */}
      {!statistics?.hasAttendanceToday && (
        <div className="mt-8">
          <Card className="border-0 shadow-lg">
            <div className="text-center py-8">
              <CloseCircleOutlined className="text-6xl text-slate-300 mb-4" />
              <Title level={4} className="text-slate-600">
                Bugun hali davomat olinmagan
              </Title>
              <p className="text-slate-400">Davomat ma'lumotlari mavjud bo'lganda bu yerda ko'rsatiladi</p>
            </div>
          </Card>
        </div>
      )}

      {/* Summary section - only show if attendance data exists */}
      {statistics?.hasAttendanceToday && (
        <div className="mt-8">
          <Card
            className="border-0 shadow-lg bg-linear-to-r from-slate-800 to-slate-900"
            styles={{
              body: { padding: "32px" },
            }}
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-white text-xl font-semibold mb-2">Bugungi davomat holati</h3>
                <p className="text-slate-400">{statistics?.presentToday || 0} ta talaba bugun qayd etildi</p>
              </div>
              <div className="flex items-center gap-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400">
                    {statistics?.studentsCount
                      ? Math.round(((statistics?.presentToday || 0) / statistics.studentsCount) * 100)
                      : 0}
                    %
                  </div>
                  <div className="text-slate-400 text-sm">Davomat foizi</div>
                </div>
                <div className="w-px h-12 bg-slate-600" />
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-400">
                    {statistics?.studentsCount
                      ? Math.round(((statistics?.absentToday || 0) / statistics.studentsCount) * 100)
                      : 0}
                    %
                  </div>
                  <div className="text-slate-400 text-sm">Kelmaganlar</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </main>
  );
};

export default StatisticsPage;
